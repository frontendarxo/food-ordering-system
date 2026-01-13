import Router from 'express';
import {
    createOrder,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.js';
import { cacheMiddleware } from '../middlewares/cache.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/', createOrder);
router.get('/', authenticate, cacheMiddleware(), getAllOrders);
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
