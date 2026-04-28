import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type JwtPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: JwtPayload;
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.access_token) return req.cookies.access_token as string;
  return null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next(ApiError.unauthorized('Authentication required'));
  req.auth = verifyAccessToken(token);
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.auth = verifyAccessToken(token);
  } catch {
    // ignore — optional
  }
  next();
}

export function requireRole(...roles: JwtPayload['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(ApiError.unauthorized());
    if (!roles.includes(req.auth.role)) return next(ApiError.forbidden('Insufficient privileges'));
    next();
  };
}

export const requireAdmin = requireRole('admin', 'superadmin');
