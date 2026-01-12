import type { NextFunction, Request, Response } from "express"
import Food from "../modules/FoodSchema.js"
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";

export const getAllFoods = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const foods = await Food.find();
        if(foods.length === 0) {
            throw new NotFoundError('Foods not found');
        }
        res.status(200).json({ foods });
    } catch (error) {
        next(error)
    }
}

export const getFoodByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.params;
        const foods = await Food.find({ category: category as string });
        if(foods.length === 0) {
            throw new NotFoundError('Foods not found');
        }
        res.status(200).json({ foods });
    } catch (error) {
        next(error)
    }
}

export const createFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, price, category, image, inStock } = req.body;

        if (!name || !price || !category || !image) {
            throw new BadRequestError('Все поля обязательны для заполнения');
        }

        if (typeof price !== 'number' || price <= 0) {
            throw new BadRequestError('Цена должна быть положительным числом');
        }

        const food = new Food({
            name,
            price,
            category,
            image,
            inStock: inStock !== undefined ? inStock : true
        });

        await food.save();
        res.status(201).json({ food });
    } catch (error) {
        next(error);
    }
}

export const updateFoodPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        if (!price || typeof price !== 'number' || price <= 0) {
            throw new BadRequestError('Цена должна быть положительным числом');
        }

        const food = await Food.findByIdAndUpdate(
            id,
            { price },
            { new: true }
        );

        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        res.status(200).json({ food });
    } catch (error) {
        next(error);
    }
}

export const updateFoodStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { inStock } = req.body;

        if (typeof inStock !== 'boolean') {
            throw new BadRequestError('inStock должен быть булевым значением');
        }

        const food = await Food.findByIdAndUpdate(
            id,
            { inStock },
            { new: true }
        );

        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        res.status(200).json({ food });
    } catch (error) {
        next(error);
    }
}

export const deleteFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const food = await Food.findByIdAndDelete(id);

        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        res.status(200).json({ message: 'Еда удалена успешно' });
    } catch (error) {
        next(error);
    }
}