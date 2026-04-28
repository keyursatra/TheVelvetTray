import type { Request, Response } from 'express';
import { z } from 'zod';
import { Hamper } from '../models/Hamper';
import { Occasion } from '../models/Occasion';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { effectiveHamperStock } from '../services/inventory.service';
import { emitAdmin } from '../services/realtime.service';

const listQuery = z.object({
  query: z.object({
    occasion: z.string().optional(),
    tier: z.enum(['signature', 'heritage', 'atelier', 'noir']).optional(),
    recipient: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    featured: z.enum(['true', 'false']).optional(),
    q: z.string().optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'featured']).optional().default('featured'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(48).default(12),
  }),
});

export const listValidator = listQuery;

export const list = catchAsync(async (req: Request, res: Response) => {
  const { occasion, tier, recipient, minPrice, maxPrice, featured, q, sort, page, limit } =
    req.query as unknown as z.infer<typeof listQuery>['query'];

  const filter: Record<string, unknown> = { isActive: true };
  if (tier) filter.tier = tier;
  if (recipient) filter.recipientTags = recipient;
  if (featured === 'true') filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter.priceINR = {
      ...(minPrice ? { $gte: minPrice } : {}),
      ...(maxPrice ? { $lte: maxPrice } : {}),
    };
  }
  if (q) filter.$text = { $search: q };

  if (occasion) {
    const occ = await Occasion.findOne({ slug: occasion, isActive: true }).select('_id');
    if (!occ) {
      res.json({ ok: true, data: [], page: 1, total: 0 });
      return;
    }
    filter.occasions = occ._id;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { priceINR: 1 },
    price_desc: { priceINR: -1 },
    newest: { createdAt: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };

  const [data, total] = await Promise.all([
    Hamper.find(filter)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('occasions', 'name slug')
      .lean(),
    Hamper.countDocuments(filter),
  ]);

  res.json({ ok: true, data, page, limit, total });
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  const hamper = await Hamper.findOne({ slug: req.params.slug, isActive: true })
    .populate('occasions', 'name slug tone')
    .populate('items.product');
  if (!hamper) throw ApiError.notFound('Hamper');

  const stock = await effectiveHamperStock(hamper);
  res.json({ ok: true, data: { ...hamper.toJSON(), effectiveStock: stock } });
});

const createSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    slug: z.string().optional(),
    tier: z.enum(['signature', 'heritage', 'atelier', 'noir']),
    tagline: z.string().optional(),
    story: z.string().min(10),
    origin: z.string().optional(),
    priceINR: z.number().int().nonnegative(),
    items: z
      .array(
        z.object({
          product: z.string(),
          quantity: z.number().int().min(1).default(1),
          categoryLabel: z.string(),
          substitutable: z.boolean().default(true),
        }),
      )
      .default([]),
    occasions: z.array(z.string()).default([]),
    recipientTags: z.array(z.string()).default([]),
    images: z
      .array(z.object({ url: z.string().url(), alt: z.string().optional() }))
      .default([]),
    heroImage: z.string().url().optional(),
    leadTimeDays: z.object({ min: z.number(), max: z.number() }).optional(),
    customization: z.array(z.any()).default([]),
    isFeatured: z.boolean().optional(),
    minOrderQty: z.number().int().min(1).optional(),
    stockOverride: z.number().int().optional(),
    seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
  }),
});

export const createValidator = createSchema;

export const create = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as z.infer<typeof createSchema>['body'];
  const hamper = await Hamper.create(payload);
  emitAdmin('hamper:update', { id: String(hamper._id), action: 'create', name: hamper.name });
  res.status(201).json({ ok: true, data: hamper });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const updated = await Hamper.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) throw ApiError.notFound('Hamper');
  emitAdmin('hamper:update', { id: String(updated._id), action: 'update', name: updated.name });
  res.json({ ok: true, data: updated });
});

export const archive = catchAsync(async (req: Request, res: Response) => {
  const updated = await Hamper.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!updated) throw ApiError.notFound('Hamper');
  emitAdmin('hamper:update', { id: String(updated._id), action: 'archive', name: updated.name });
  res.json({ ok: true });
});
