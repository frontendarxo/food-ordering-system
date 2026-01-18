import Router from 'express';
import {
    createOrder,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} from '../controllers/order.js';
import { cacheMiddleware } from '../middlewares/cache.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/', createOrder);
router.get('/', authenticate, cacheMiddleware(), getAllOrders);
router.patch('/:id/status', authenticate, updateOrderStatus);
router.delete('/:id', authenticate, deleteOrder);

export default router;
