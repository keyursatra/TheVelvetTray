import { Router } from 'express';
import * as corp from '../controllers/corporate.controller';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/enquiries', validate(corp.createValidator), corp.create);
router.get('/enquiries', requireAuth, requireAdmin, corp.list);
router.patch('/enquiries/:id', requireAuth, requireAdmin, corp.updateStatus);

export default router;
