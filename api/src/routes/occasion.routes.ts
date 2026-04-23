import { Router } from 'express';
import * as occasion from '../controllers/occasion.controller';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', occasion.list);
router.get('/:slug', occasion.getBySlug);

router.post('/', requireAuth, requireAdmin, occasion.upsert);
router.put('/:id', requireAuth, requireAdmin, occasion.upsert);

export default router;
