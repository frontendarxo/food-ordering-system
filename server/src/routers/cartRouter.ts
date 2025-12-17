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

router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCartItem);
router.delete('/', removeFromCart);
router.delete('/clear', clearCart);

export default router;
