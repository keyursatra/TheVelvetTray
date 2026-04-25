import { Router } from 'express';
import mongoose from 'mongoose';
import auth from './auth.routes';
import hamper from './hamper.routes';
import occasion from './occasion.routes';
import region from './region.routes';
import order from './order.routes';
import corporate from './corporate.routes';
import admin from './admin.routes';

const api = Router();

// Liveness: process is up
api.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'velvettray-api', time: new Date().toISOString() }),
);

// Readiness: DB reachable
api.get('/ready', async (_req, res) => {
  const state = mongoose.connection.readyState; // 1 = connected
  if (state !== 1) {
    res.status(503).json({ ok: false, error: { code: 'DB_DOWN', message: 'database unavailable' } });
    return;
  }
  try {
    await mongoose.connection.db?.admin().ping();
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(503).json({ ok: false, error: { code: 'DB_PING_FAIL', message: 'ping failed' } });
  }
});

api.use('/auth', auth);
api.use('/hampers', hamper);
api.use('/occasions', occasion);
api.use('/regions', region);
api.use('/orders', order);
api.use('/corporate', corporate);
api.use('/admin', admin);

export default api;
