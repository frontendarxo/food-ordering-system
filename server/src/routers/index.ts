import Router from 'express';
import foodRouter from './foodRouter.js';
import orderRouter from './orderRouter.js';
import authRouter from './authRouter.js';
import categoryRouter from './categorierRouter.js';
import dashboardRouter from './dashboardRouter.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/foods', foodRouter);
router.use('/orders', orderRouter);
router.use('/categories', categoryRouter);
router.use('/dashboard', dashboardRouter);

export default router;