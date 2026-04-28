import { Router } from 'express';
import * as hamper from '../controllers/hamper.controller';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public
router.get('/', validate(hamper.listValidator), hamper.list);
router.get('/:slug', hamper.getBySlug);

// Admin
router.post('/', requireAuth, requireAdmin, validate(hamper.createValidator), hamper.create);
router.patch('/:id', requireAuth, requireAdmin, hamper.update);
router.delete('/:id', requireAuth, requireAdmin, hamper.archive);

export default router;
