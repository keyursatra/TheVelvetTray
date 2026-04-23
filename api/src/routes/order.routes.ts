import { Router } from 'express';
import * as order from '../controllers/order.controller';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/', optionalAuth, validate(order.createValidator), order.create);
router.post('/verify-payment', optionalAuth, validate(order.verifyValidator), order.verifyPayment);

router.get('/mine', requireAuth, order.myOrders);
router.get('/:number', optionalAuth, order.getByNumber);

router.patch('/:id/status', requireAuth, requireAdmin, validate(order.statusValidator), order.updateStatus);

export default router;
