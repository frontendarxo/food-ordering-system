import Router from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
    createOrder,
    getUserOrders,
    getOrderById
} from '../controllers/order.js';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderById);

export default router;
