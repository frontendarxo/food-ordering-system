import Router from 'express';
import { getAllFoods, getFoodByCategory } from '../controllers/food.js';

const router = Router();

router.get('/', getAllFoods);
router.get('/:category', getFoodByCategory);

export default router;