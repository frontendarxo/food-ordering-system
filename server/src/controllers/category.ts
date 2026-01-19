import { Request, Response, NextFunction } from "express";
import { ConflictError } from "../errors/conflict.js";
import Categories from "../modules/categoriesSchema.js";
import { BadRequestError } from "../errors/bad-request.js";
import { NotFoundError } from "../errors/not-found.js";

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Categories.find({}).select('_id name');
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
}

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название категории обязательно');
        }
        const trimmedName = name.trim();
        const existingCategory = await Categories.findOne({ name: trimmedName });
        if (existingCategory) {
            throw new ConflictError('Категория с таким названием уже существует');
        }
        const category = new Categories({ name: trimmedName });
        await category.save();
        res.status(201).json({ message: 'Категория создана успешно', category: category.name });
    } catch (error) {
        next(error);
    }
}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название категории обязательно');
        }
        const trimmedName = name.trim();
        const categoryToUpdate = await Categories.findById(id);
        if (!categoryToUpdate) {
            throw new NotFoundError('Категория не найдена');
        }
        const existingCategory = await Categories.findOne({ name: trimmedName, _id: { $ne: id } });
        if (existingCategory) {
            throw new ConflictError('Категория с таким названием уже существует');
        }
        categoryToUpdate.name = trimmedName;
        await categoryToUpdate.save();
        res.status(200).json({ message: 'Категория обновлена успешно', category: categoryToUpdate.name });
    } catch (error) {   
        next(error);
    }
}

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const category = await Categories.findByIdAndDelete(id);
        if(!category) {
            throw new NotFoundError('Категория не найдена');
        }
        res.status(204).json({ message: 'Категория удалена успешно', category: category.name });
    } catch (error) {
        next(error);
    }
}