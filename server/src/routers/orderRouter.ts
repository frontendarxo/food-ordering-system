import Router from 'express';
import {
    createOrder,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.js';
import { cacheMiddleware } from '../middlewares/cache.js';

const router = Router();

router.post('/', createOrder);
router.get('/', cacheMiddleware(), getAllOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
