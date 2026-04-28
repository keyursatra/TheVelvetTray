import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { env, isProd } from './config/env';
import api from './routes';
import { errorHandler, notFound } from './middleware/error';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false, // enabled at CDN/edge
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  // Support comma-separated origin lists (prod multi-domain) and exact-match check.
  const allowedOrigins = new Set(
    [env.WEB_ORIGIN, env.ADMIN_ORIGIN]
      .flatMap((v) => v.split(','))
      .map((v) => v.trim())
      .filter(Boolean),
  );

  app.use(
    cors({
      origin: (origin, cb) => {
        // Server-to-server / curl have no origin → allow.
        if (!origin) return cb(null, true);
        if (allowedOrigins.has(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(mongoSanitize());
  app.use(hpp());
  if (!isProd) app.use(morgan('dev'));

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
    }),
  );

  app.use('/v1', api);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
