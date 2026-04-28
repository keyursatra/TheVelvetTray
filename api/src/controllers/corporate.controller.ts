import type { Request, Response } from 'express';
import { z } from 'zod';
import { CorporateEnquiry, type EnquiryStatus } from '../models/CorporateEnquiry';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { emitAdmin } from '../services/realtime.service';
import { sendEmail } from '../services/email.service';

const createSchema = z.object({
  body: z.object({
    contact: z.object({
      name: z.string().min(2),
      designation: z.string().optional(),
      email: z.string().email(),
      phone: z.string().min(6),
      company: z.string().min(2),
      gstin: z.string().optional(),
    }),
    budgetINR: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
    recipientCount: z.number().int().positive().optional(),
    occasion: z.string().optional(),
    targetDeliveryDate: z.coerce.date().optional(),
    hampersOfInterest: z.array(z.string()).optional(),
    brandingRequired: z.boolean().default(false),
    brandingNotes: z.string().optional(),
    shippingMode: z.enum(['single', 'multi']).default('single'),
    addresses: z.number().int().optional(),
    notes: z.string().optional(),
  }),
});

export const createValidator = createSchema;

export const create = catchAsync(async (req: Request, res: Response) => {
  const enquiry = await CorporateEnquiry.create({
    ...req.body,
    status: 'new',
    history: [{ status: 'new', at: new Date() }],
  });

  emitAdmin('enquiry:new', {
    id: String(enquiry._id),
    reference: enquiry.reference,
    company: enquiry.contact.company,
    recipients: enquiry.recipientCount,
  });

  await sendEmail({
    to: enquiry.contact.email,
    subject: `We've received your enquiry — ${enquiry.reference}`,
    html: `<p>Dear ${enquiry.contact.name},</p>
      <p>Thank you for reaching out to The Velvet Tray. Our gifting concierge will respond within one working day with curated options.</p>
      <p>Reference: <strong>${enquiry.reference}</strong></p>
      <p>— The Velvet Tray</p>`,
  });

  res.status(201).json({
    ok: true,
    data: { reference: enquiry.reference, status: enquiry.status, id: enquiry._id },
  });
});

export const list = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const data = await CorporateEnquiry.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ ok: true, data });
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, note, quoteAmountINR, quoteDocUrl } = req.body as {
    status: EnquiryStatus;
    note?: string;
    quoteAmountINR?: number;
    quoteDocUrl?: string;
  };
  const enquiry = await CorporateEnquiry.findById(req.params.id);
  if (!enquiry) throw ApiError.notFound('Enquiry');
  enquiry.status = status;
  if (quoteAmountINR !== undefined) enquiry.quoteAmountINR = quoteAmountINR;
  if (quoteDocUrl) enquiry.quoteDocUrl = quoteDocUrl;
  enquiry.history.push({ status, at: new Date(), note, by: req.auth?.sub as unknown as never });
  await enquiry.save();

  emitAdmin('enquiry:update', { id: String(enquiry._id), reference: enquiry.reference, status });
  res.json({ ok: true, data: enquiry });
});
