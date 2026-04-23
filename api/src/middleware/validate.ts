import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!parsed.success) return next(parsed.error);
    const data = parsed.data as { body?: unknown; query?: unknown; params?: unknown };
    if (data.body) req.body = data.body;
    if (data.query) req.query = data.query as Request['query'];
    if (data.params) req.params = data.params as Request['params'];
    next();
  };

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
