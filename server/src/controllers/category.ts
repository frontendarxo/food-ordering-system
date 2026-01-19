import { Request, Response, NextFunction } from "express";
import { ConflictError } from "../errors/conflict.js";
import Categories from "../modules/categoriesSchema.js";
import { BadRequestError } from "../errors/bad-request.js";
import { NotFoundError } from "../errors/not-found.js";


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
        const existingCategory = await Categories.findOne({ name: trimmedName });
        if (existingCategory) {
            throw new ConflictError('Категория с таким названием уже существует');
        }
        const category = await Categories.findByIdAndUpdate(id, { name: trimmedName })
        await category?.save();
        res.status(204).json({ message: 'Категория обновлена успешно', category: category?.name });
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