import Router from 'express';
import {
    createOrder
} from '../controllers/order.js';

const router = Router();

router.post('/', createOrder);

export default router;
