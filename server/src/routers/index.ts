import Router from 'express';
import foodRouter from './foodRouter.js';
import orderRouter from './orderRouter.js';

const router = Router();

router.use('/foods', foodRouter); 
router.use('/orders', orderRouter);

export default router;