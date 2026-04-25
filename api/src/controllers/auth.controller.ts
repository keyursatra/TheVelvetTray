import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { catchAsync } from '../utils/catchAsync';
import { env, isProd } from '../config/env';

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().optional(),
    role: z.enum(['customer', 'corporate']).optional(),
    company: z
      .object({
        legalName: z.string(),
        brandName: z.string().optional(),
        gstin: z.string().optional(),
        pan: z.string().optional(),
      })
      .optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const registerValidator = registerSchema;
export const loginValidator = loginSchema;

function setAuthCookies(res: Response, access: string, refresh: string) {
  const common = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/',
  };
  res.cookie('access_token', access, { ...common, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refresh, { ...common, maxAge: 30 * 24 * 60 * 60 * 1000, path: '/auth' });
}

function publicUser(user: { _id: unknown; name: string; email: string; role: string; phone?: string }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, phone, role = 'customer', company } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role,
    company: role === 'corporate' ? company : undefined,
  });

  const payload = { sub: String(user._id), role: user.role, email: user.email };
  const access = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  setAuthCookies(res, access, refreshToken);

  res.status(201).json({
    ok: true,
    data: { user: publicUser(user), accessToken: access },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid credentials');
  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const payload = { sub: String(user._id), role: user.role, email: user.email };
  const access = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  setAuthCookies(res, access, refreshToken);

  res.json({
    ok: true,
    data: { user: publicUser(user), accessToken: access },
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = (req.cookies?.refresh_token as string | undefined) ?? req.body?.refreshToken;
  if (!token) throw ApiError.unauthorized('Missing refresh token');
  const payload = verifyRefreshToken(token);
  const access = signAccessToken({ sub: payload.sub, role: payload.role, email: payload.email });
  const refreshNew = signRefreshToken({ sub: payload.sub, role: payload.role, email: payload.email });
  setAuthCookies(res, access, refreshNew);
  res.json({ ok: true, data: { accessToken: access } });
});

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/auth' });
  res.json({ ok: true, data: { signedOut: true } });
};

export const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.auth) throw ApiError.unauthorized();
  const user = await User.findById(req.auth.sub);
  if (!user) throw ApiError.notFound('User');
  res.json({ ok: true, data: publicUser(user) });
});
