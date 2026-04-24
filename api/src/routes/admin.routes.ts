import { Router } from 'express';
import * as admin from '../controllers/admin.controller';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', admin.dashboard);
router.get('/orders', admin.listOrders);
router.get('/orders/:id', admin.getOrder);

export default router;
