import Router from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cart.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart); // 100
router.post('/', addToCart); // 100
router.put('/:foodId', updateCartItem); // 100
router.delete('/:foodId', removeFromCart); // 100
router.delete('/', clearCart); // 100

export default router;
