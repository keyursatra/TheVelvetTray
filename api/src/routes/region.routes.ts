import { Router } from 'express';
import * as region from '../controllers/region.controller';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', region.list);
router.get('/:slug', region.getBySlug);

router.post('/', requireAuth, requireAdmin, region.upsert);
router.put('/:id', requireAuth, requireAdmin, region.upsert);

export default router;
