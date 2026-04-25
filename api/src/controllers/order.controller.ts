import type { Request, Response } from 'express';
import type { Types } from 'mongoose';
import { z } from 'zod';
import { Order, type OrderStatus, type OrderLine } from '../models/Order';
import { Hamper } from '../models/Hamper';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { emitAdmin } from '../services/realtime.service';
import { consumeHamperStock } from '../services/inventory.service';
import { createPaymentOrder, verifyPaymentSignature } from '../services/razorpay.service';

const addressSchema = z.object({
  label: z.string().optional(),
  name: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string().default('IN'),
  landmark: z.string().optional(),
});

const lineSchema = z.object({
  hamperId: z.string(),
  quantity: z.number().int().min(1),
  customization: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  giftNote: z.object({ to: z.string().optional(), from: z.string().optional(), message: z.string().optional() }).optional(),
  shippingAddress: addressSchema,
  deliveryDate: z.coerce.date().optional(),
});

const createOrderSchema = z.object({
  body: z.object({
    type: z.enum(['individual', 'corporate', 'wedding', 'custom']).default('individual'),
    guestEmail: z.string().email().optional(),
    guestPhone: z.string().optional(),
    lines: z.array(lineSchema).min(1),
    coupon: z.string().optional(),
    corporate: z
      .object({
        poNumber: z.string().optional(),
        approvedBy: z.string().optional(),
        branding: z.object({ logoUrl: z.string().optional(), noteCopy: z.string().optional() }).optional(),
        splitByAddress: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const createValidator = createOrderSchema;

const GST_RATE = 0.18;
const FREE_SHIPPING_ABOVE = 2500;
const STANDARD_SHIPPING = 120;

export const create = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as z.infer<typeof createOrderSchema>['body'];
  const userId = req.auth?.sub;

  let subtotal = 0;
  const lines: unknown[] = [];

  for (const line of body.lines) {
    const hamper = await Hamper.findById(line.hamperId);
    if (!hamper || !hamper.isActive) throw ApiError.badRequest(`Hamper unavailable: ${line.hamperId}`);

    if (line.quantity < hamper.minOrderQty) {
      throw ApiError.badRequest(
        `${hamper.name} requires a minimum order of ${hamper.minOrderQty}`,
      );
    }

    // Validate customization keys against the hamper's allowed options + apply price deltas.
    let customizationDelta = 0;
    const optionByKey = new Map<string, (typeof hamper.customization)[number]>();
    for (const o of hamper.customization) optionByKey.set(o.key, o);

    for (const c of line.customization ?? []) {
      const opt = optionByKey.get(c.key);
      if (!opt) throw ApiError.badRequest(`Unsupported customization "${c.key}" for ${hamper.name}`);
      if (opt.maxLength && c.value.length > opt.maxLength) {
        throw ApiError.badRequest(`Customization "${c.key}" exceeds ${opt.maxLength} characters`);
      }
      if (opt.priceDeltaINR) customizationDelta += opt.priceDeltaINR;
    }

    const submittedKeys = new Set((line.customization ?? []).map((c) => c.key));
    for (const opt of hamper.customization) {
      if (opt.required && !submittedKeys.has(opt.key)) {
        throw ApiError.badRequest(`Customization "${opt.key}" is required for ${hamper.name}`);
      }
    }

    const unit = hamper.priceINR + customizationDelta;
    subtotal += unit * line.quantity;
    lines.push({
      hamper: hamper._id,
      hamperSnapshot: {
        name: hamper.name,
        slug: hamper.slug,
        tier: hamper.tier,
        priceINR: hamper.priceINR,
        image: hamper.heroImage ?? hamper.images?.[0]?.url,
      },
      quantity: line.quantity,
      unitPriceINR: unit,
      customization: line.customization,
      giftNote: line.giftNote,
      shippingAddress: line.shippingAddress,
      deliveryDate: line.deliveryDate,
      status: 'pending_payment' as OrderStatus,
    });
  }

  const tax = Math.round(subtotal * GST_RATE);
  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : STANDARD_SHIPPING;
  const total = subtotal + tax + shipping;

  const order = await Order.create({
    user: userId,
    guestEmail: body.guestEmail,
    guestPhone: body.guestPhone,
    type: body.type,
    lines,
    subtotalINR: subtotal,
    taxINR: tax,
    shippingINR: shipping,
    discountINR: 0,
    totalINR: total,
    coupon: body.coupon,
    corporate: body.corporate,
    status: 'pending_payment',
    statusHistory: [{ status: 'pending_payment', at: new Date() }],
  });

  // Razorpay order (if configured)
  let rzp: { id: string; amount: number; currency: string } | null = null;
  try {
    rzp = await createPaymentOrder({
      amountINR: total,
      receipt: order.number,
      notes: { orderId: String(order._id), orderNumber: order.number },
    });
    order.paymentMeta = { ...(order.paymentMeta ?? {}), razorpayOrderId: rzp.id };
    order.paymentProvider = 'razorpay';
    await order.save();
  } catch {
    // Razorpay not configured yet — order created unpaid; admin can capture manually.
  }

  emitAdmin('order:new', {
    id: String(order._id),
    number: order.number,
    total: order.totalINR,
    type: order.type,
    items: order.lines.length,
  });

  res.status(201).json({
    ok: true,
    data: {
      order,
      payment: rzp
        ? { provider: 'razorpay', orderId: rzp.id, amount: rzp.amount, currency: rzp.currency }
        : null,
    },
  });
});

const verifySchema = z.object({
  body: z.object({
    orderId: z.string(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }),
});

export const verifyValidator = verifySchema;

export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order');
  if (order.paymentMeta?.razorpayOrderId !== razorpayOrderId) {
    throw ApiError.badRequest('Payment does not match order');
  }
  const ok = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!ok) throw ApiError.badRequest('Invalid signature');

  order.paymentStatus = 'captured';
  order.status = 'paid';
  order.paymentMeta = {
    ...(order.paymentMeta ?? {}),
    razorpayPaymentId,
    razorpaySignature,
  };
  order.statusHistory.push({ status: 'paid', at: new Date() });
  await order.save();

  // Consume stock, possibly applying substitutions per line.
  for (const line of order.lines) {
    const { ok: consumed, substitutions } = await consumeHamperStock(
      String(line.hamper),
      line.quantity,
    );
    line.status = consumed ? 'paid' : 'in_production'; // ops resolves OOS lines
    if (substitutions?.length) line.substitutions = substitutions;
  }
  order.markModified('lines'); // ensure subdoc array updates persist
  await order.save();

  emitAdmin('order:update', { id: String(order._id), number: order.number, status: order.status });
  res.json({ ok: true, data: order });
});

export const myOrders = catchAsync(async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const orders = await Order.find({ user: req.auth.sub }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, data: orders });
});

export const getByNumber = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findOne({ number: req.params.number });
  if (!order) throw ApiError.notFound('Order');
  // Guest tracking — allow access if email or phone matches
  if (!req.auth) {
    const { email, phone } = req.query;
    const matchEmail = email && order.guestEmail === String(email).toLowerCase();
    const matchPhone = phone && order.guestPhone === String(phone);
    if (!matchEmail && !matchPhone) throw ApiError.forbidden('Provide email or phone to track');
  } else if (
    req.auth.role !== 'admin' &&
    req.auth.role !== 'superadmin' &&
    order.user?.toString() !== req.auth.sub
  ) {
    throw ApiError.forbidden();
  }
  res.json({ ok: true, data: order });
});

// Admin ops: status transitions
const statusSchema = z.object({
  body: z.object({
    status: z.enum([
      'pending_payment',
      'paid',
      'in_production',
      'packed',
      'dispatched',
      'out_for_delivery',
      'delivered',
      'partially_delivered',
      'failed',
      'cancelled',
      'refunded',
    ]),
    note: z.string().optional(),
    lineId: z.string().optional(),
  }),
});

export const statusValidator = statusSchema;

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { status, note, lineId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order');

  if (lineId) {
    // order.lines is a Mongoose DocumentArray at runtime; cast for the .id() helper.
    const lines = order.lines as unknown as Types.DocumentArray<OrderLine>;
    const line = lines.id(lineId);
    if (!line) throw ApiError.notFound('Order line');
    line.status = status;
    order.markModified('lines');
    // If all lines delivered -> order delivered; some -> partial
    const statuses = order.lines.map((l) => l.status);
    if (statuses.every((s) => s === 'delivered')) order.status = 'delivered';
    else if (statuses.some((s) => s === 'delivered')) order.status = 'partially_delivered';
  } else {
    order.status = status;
  }

  order.statusHistory.push({
    status: status as OrderStatus,
    at: new Date(),
    note,
    by: req.auth?.sub as unknown as never,
  });
  await order.save();

  emitAdmin('order:status', { id: String(order._id), number: order.number, status: order.status });
  res.json({ ok: true, data: order });
});
