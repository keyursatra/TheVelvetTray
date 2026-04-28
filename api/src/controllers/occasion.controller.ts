import type { Request, Response } from 'express';
import { Occasion } from '../models/Occasion';
import { Hamper } from '../models/Hamper';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

export const list = catchAsync(async (_req: Request, res: Response) => {
  const data = await Occasion.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json({ ok: true, data });
});

export const getBySlug = catchAsync(async (req: Request, res: Response) => {
  const occasion = await Occasion.findOne({ slug: req.params.slug, isActive: true });
  if (!occasion) throw ApiError.notFound('Occasion');
  const hampers = await Hamper.find({ occasions: occasion._id, isActive: true })
    .sort({ isFeatured: -1, priceINR: 1 })
    .limit(24)
    .lean();
  res.json({ ok: true, data: { occasion, hampers } });
});

export const upsert = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = id
    ? await Occasion.findByIdAndUpdate(id, req.body, { new: true })
    : await Occasion.create(req.body);
  if (!updated) throw ApiError.notFound('Occasion');
  res.json({ ok: true, data: updated });
});
