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
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', cacheMiddleware(), getAllFoods);
router.get('/:category', cacheMiddleware(), getFoodByCategory);
router.post('/', authenticate, upload.single('image'), createFood);
router.patch('/:id/price', authenticate, updateFoodPrice);
router.patch('/:id/stock', authenticate, updateFoodStock);
router.patch('/:id/name', authenticate, updateFoodName);
router.patch('/:id/image', authenticate, upload.single('image'), updateFoodImage);
router.delete('/:id', authenticate, deleteFood);

export default router;