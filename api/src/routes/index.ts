import { Router } from 'express';
import auth from './auth.routes';
import hamper from './hamper.routes';
import occasion from './occasion.routes';
import region from './region.routes';
import order from './order.routes';
import corporate from './corporate.routes';
import admin from './admin.routes';

const api = Router();

api.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'velvettray-api', time: new Date().toISOString() }),
);

api.use('/auth', auth);
api.use('/hampers', hamper);
api.use('/occasions', occasion);
api.use('/regions', region);
api.use('/orders', order);
api.use('/corporate', corporate);
api.use('/admin', admin);

export default api;
