import type { Request, Response } from 'express';
import { Order } from '../models/Order';
import { CorporateEnquiry } from '../models/CorporateEnquiry';
import { Product } from '../models/Product';
import { Hamper } from '../models/Hamper';
import { User } from '../models/User';
import { catchAsync } from '../utils/catchAsync';

export const dashboard = catchAsync(async (_req: Request, res: Response) => {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [
    revenue30,
    revenue7,
    ordersToday,
    ordersPending,
    enquiriesNew,
    lowStock,
    outOfStock,
    recentOrders,
    recentEnquiries,
    customers,
    totalHampers,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'captured', createdAt: { $gte: last30 } } },
      { $group: { _id: null, sum: { $sum: '$totalINR' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'captured', createdAt: { $gte: last7 } } },
      { $group: { _id: null, sum: { $sum: '$totalINR' }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments({ status: { $in: ['paid', 'in_production', 'packed'] } }),
    CorporateEnquiry.countDocuments({ status: { $in: ['new', 'in_review'] } }),
    Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, isActive: true })
      .select('name sku stock lowStockThreshold')
      .limit(10)
      .lean(),
    Product.countDocuments({ stock: { $lte: 0 }, isActive: true }),
    Order.find({}).sort({ createdAt: -1 }).limit(10).select('_id number status totalINR createdAt type').lean(),
    CorporateEnquiry.find({}).sort({ createdAt: -1 }).limit(10).select('_id reference contact status createdAt').lean(),
    User.countDocuments({ role: { $in: ['customer', 'corporate'] } }),
    Hamper.countDocuments({ isActive: true }),
  ]);

  res.json({
    ok: true,
    data: {
      revenue: {
        last30: revenue30[0] ?? { sum: 0, count: 0 },
        last7: revenue7[0] ?? { sum: 0, count: 0 },
      },
      ordersToday,
      ordersPending,
      enquiriesNew,
      lowStock,
      outOfStock,
      recentOrders,
      recentEnquiries,
      totalHampers,
      customers,
    },
  });
});

export const getOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
  return res.json({ ok: true, data: order });
});

export const listOrders = catchAsync(async (req: Request, res: Response) => {
  const { status, type, q, page = '1', limit = '30' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (q) filter.number = { $regex: q, $options: 'i' };

  const p = Math.max(1, Number(page));
  const l = Math.min(100, Number(limit));

  const [data, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ ok: true, data, page: p, limit: l, total });
});
