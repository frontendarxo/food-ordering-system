var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Category from "../modules/CategorySchema.js";
import Food from "../modules/FoodSchema.js";
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";
import { UnauthorizedError } from "../errors/unauthorized.js";
import { ConflictError } from "../errors/conflict.js";
import { invalidateFoodCache } from "../utils/cache.js";
const requireAdmin = (userRole) => {
    if (userRole !== 'admin') {
        throw new UnauthorizedError('Только администратор может выполнять эту операцию');
    }
};
export const getAllCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category.find().sort({ name: 1 });
        res.status(200).json({ categories: categories.map(c => c.name) });
    }
    catch (error) {
        next(error);
    }
});
export const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название категории обязательно');
        }
        const trimmedName = name.trim();
        const existingCategory = yield Category.findOne({ name: trimmedName });
        if (existingCategory) {
            throw new ConflictError('Категория с таким названием уже существует');
        }
        const category = new Category({ name: trimmedName });
        yield category.save();
        yield invalidateFoodCache();
        res.status(201).json({ category: category.name });
    }
    catch (error) {
        next(error);
    }
});
export const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { name: oldName } = req.params;
        const { name: newName } = req.body;
        if (!newName || typeof newName !== 'string' || !newName.trim()) {
            throw new BadRequestError('Новое название категории обязательно');
        }
        const trimmedNewName = newName.trim();
        if (trimmedNewName === oldName) {
            throw new BadRequestError('Новое название должно отличаться от текущего');
        }
        const category = yield Category.findOne({ name: oldName });
        if (!category) {
            throw new NotFoundError('Категория не найдена');
        }
        const existingCategory = yield Category.findOne({ name: trimmedNewName });
        if (existingCategory) {
            throw new ConflictError('Категория с таким названием уже существует');
        }
        yield Category.updateOne({ name: oldName }, { name: trimmedNewName });
        yield Food.updateMany({ category: oldName }, { category: trimmedNewName });
        yield invalidateFoodCache();
        res.status(200).json({ category: trimmedNewName });
    }
    catch (error) {
        next(error);
    }
});
export const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { name } = req.params;
        const category = yield Category.findOne({ name });
        if (!category) {
            throw new NotFoundError('Категория не найдена');
        }
        const foodsCount = yield Food.countDocuments({ category: name });
        if (foodsCount > 0) {
            throw new BadRequestError(`Невозможно удалить категорию: в ней находится ${foodsCount} ${foodsCount === 1 ? 'блюдо' : 'блюд'}. Сначала переместите или удалите блюда.`);
        }
        yield Category.deleteOne({ name });
        yield invalidateFoodCache();
        res.status(200).json({ message: 'Категория удалена успешно' });
    }
    catch (error) {
        next(error);
    }
});
