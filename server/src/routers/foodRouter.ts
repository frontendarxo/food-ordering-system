import Router from 'express';
import { 
    getAllFoods, 
    getFoodByCategory,
    createFood,
    updateFoodPrice,
    updateFoodStock,
    updateFoodName,
    updateFoodImage,
    deleteFood
} from '../controllers/food.js';
import { upload } from '../middlewares/upload.js';
import { cacheMiddleware } from '../middlewares/cache.js';

const router = Router();

router.get('/', cacheMiddleware(), getAllFoods);
router.get('/:category', cacheMiddleware(), getFoodByCategory);
router.post('/', upload.single('image'), createFood);
router.patch('/:id/price', updateFoodPrice);
router.patch('/:id/stock', updateFoodStock);
router.patch('/:id/name', updateFoodName);
router.patch('/:id/image', upload.single('image'), updateFoodImage);
router.delete('/:id', deleteFood);

export default router;