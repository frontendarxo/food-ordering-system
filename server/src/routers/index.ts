import Router from 'express';
import foodRouter from './foodRouter.js';
import usersRouter from './users.js';
import cartRouter from './cartRouter.js';
import orderRouter from './orderRouter.js';

const router = Router();

router.use('/foods', foodRouter); // Проверено, результаты совпадают
router.use('/users', usersRouter); // Проверено, результаты совпадают
router.use('/cart', cartRouter); // Проверено, результаты совпадают
router.use('/orders', orderRouter);

export default router;