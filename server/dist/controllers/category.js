var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ConflictError } from "../errors/conflict.js";
import Categories from "../modules/categoriesSchema.js";
import { BadRequestError } from "../errors/bad-request.js";
import { NotFoundError } from "../errors/not-found.js";
export const getAllCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Categories.find({}).select('_id name');
        res.status(200).json(categories);
    }
    catch (error) {
        next(error);
    }
});
export const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название категории обязательно');
        }
        const trimmedName = name.trim();
        const existingCategory = yield Categories.findOne({ name: trimmedName });
        if (existingCategory) {
            throw new ConflictError('Категория с таким названием уже существует');
        }
        const category = new Categories({ name: trimmedName });
        yield category.save();
        res.status(201).json({ message: 'Категория создана успешно', category: category.name });
    }
    catch (error) {
        next(error);
    }
});
export const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название категории обязательно');
        }
        const trimmedName = name.trim();
        const categoryToUpdate = yield Categories.findById(id);
        if (!categoryToUpdate) {
            throw new NotFoundError('Категория не найдена');
        }
        const existingCategory = yield Categories.findOne({ name: trimmedName, _id: { $ne: id } });
        if (existingCategory) {
            throw new ConflictError('Категория с таким названием уже существует');
        }
        categoryToUpdate.name = trimmedName;
        yield categoryToUpdate.save();
        res.status(200).json({ message: 'Категория обновлена успешно', category: categoryToUpdate.name });
    }
    catch (error) {
        next(error);
    }
});
export const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield Categories.findByIdAndDelete(id);
        if (!category) {
            throw new NotFoundError('Категория не найдена');
        }
        res.status(204).json({ message: 'Категория удалена успешно', category: category.name });
    }
    catch (error) {
        next(error);
    }
});
