import { Router } from "express";
import { authenticate } from "../middlewares/auth.js";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.js";

const router = Router();

router.get('/', getAllCategories);
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

export default router;