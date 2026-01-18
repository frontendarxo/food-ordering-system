import Router from 'express';
import foodRouter from './foodRouter.js';
import orderRouter from './orderRouter.js';
import authRouter from './authRouter.js';
const router = Router();
router.use('/auth', authRouter);
router.use('/foods', foodRouter);
router.use('/orders', orderRouter);
export default router;
