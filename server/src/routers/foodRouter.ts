import Router from 'express';
import { 
    getAllFoods, 
    getFoodByCategory,
    createFood,
    updateFoodPrice,
    updateFoodStock,
    deleteFood
} from '../controllers/food.js';

const router = Router();

router.get('/', getAllFoods);
router.get('/:category', getFoodByCategory);
router.post('/', createFood);
router.patch('/:id/price', updateFoodPrice);
router.patch('/:id/stock', updateFoodStock);
router.delete('/:id', deleteFood);

export default router;