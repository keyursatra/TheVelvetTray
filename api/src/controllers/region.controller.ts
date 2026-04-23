import type { Request, Response } from 'express';
import { Region } from '../models/Region';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

export const list = catchAsync(async (_req: Request, res: Response) => {
  const data = await Region.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json({ ok: true, data });
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  const region = await Region.findOne({ slug: req.params.slug, isActive: true });
  if (!region) throw ApiError.notFound('Region');
  const products = await Product.find({ region: region._id, isActive: true }).limit(24).lean();
  res.json({ ok: true, data: { region, products } });
});

export const upsert = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = id
    ? await Region.findByIdAndUpdate(id, req.body, { new: true })
    : await Region.create(req.body);
  if (!updated) throw ApiError.notFound('Region');
  res.json({ ok: true, data: updated });
});
