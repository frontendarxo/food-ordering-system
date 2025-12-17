import Router from 'express';
import foodRouter from './foodRouter.js';
import authRouter from './authRouter.js';
import cartRouter from './cartRouter.js';
import orderRouter from './orderRouter.js';

const router = Router();

router.use('/foods', foodRouter); 
router.use('/auth', authRouter); 
router.use('/cart', cartRouter); 
router.use('/orders', orderRouter);

export default router;