import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { isProd } from '../config/env';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound('Route not found'));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let status = 500;
  let code = 'INTERNAL';
  let message = 'Something went wrong';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 422;
    code = 'VALIDATION';
    message = 'Validation failed';
    details = err.flatten();
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    code = 'VALIDATION';
    message = 'Invalid payload';
    details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, (v as mongoose.Error.ValidatorError).message]),
    );
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = 'BAD_ID';
    message = `Invalid ${err.path}`;
  } else if ((err as { code?: number })?.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    message = 'Duplicate resource';
    details = (err as { keyValue?: unknown }).keyValue;
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  if (status >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');
  } else {
    logger.debug({ err: err instanceof Error ? err.message : err, status, path: req.originalUrl });
  }

  res.status(status).json({
    ok: false,
    error: { code, message, ...(details ? { details } : {}) },
    ...(isProd || !(err instanceof Error) ? {} : { stack: err.stack }),
  });
};
