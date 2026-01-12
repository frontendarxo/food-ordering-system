import Router from 'express';
import {
    createOrder,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.js';

const router = Router();

router.post('/', createOrder);
router.get('/', getAllOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;
