import Router from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.js';
import { authenticate } from '../middlewares/auth.js';
const router = Router();
router.get('/', getAllCategories);
router.post('/', authenticate, createCategory);
router.patch('/:name', authenticate, updateCategory);
router.delete('/:name', authenticate, deleteCategory);
export default router;
