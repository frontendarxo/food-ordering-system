import type { NextFunction, Response } from "express";
import User from "../modules/userSchema.js";    
import Food from "../modules/FoodSchema.js";
import type { AuthRequest } from "../middlewares/auth.js";
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.userId).populate('cart.food');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({ cart: user.cart });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { foodId, quantity = 1 } = req.body;

        const food = await Food.findById(foodId);
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        const user = await User.findById(req.userId);
        if (!user) {
            throw new NotFoundError('Пользователь не найден');
        }

        const existingItemIndex = user.cart.findIndex(
            item => item.food.toString() === foodId
        );

        if (existingItemIndex >= 0) {
            user.cart[existingItemIndex]!.quantity += quantity;
        } else {
            user.cart.push({ food: foodId, quantity });
        }

        await user.save();
        await user.populate('cart.food');

        res.json({ message: 'Товар добавлен в корзину', cart: user.cart });
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { foodId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            throw new BadRequestError('Количество должно быть больше 0');
        }

        const user = await User.findById(req.userId);
        if (!user) {
            throw new NotFoundError('Пользователь не найден');
        }

        const itemIndex = user.cart.findIndex(
            item => item.food.toString() === foodId
        );

        if (itemIndex === -1) {
            throw new NotFoundError('Товар не найден в корзине');
        }

        user.cart[itemIndex]!.quantity = quantity;
        await user.save();
        await user.populate('cart.food');

        res.json({ message: 'Корзина обновлена', cart: user.cart });
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { foodId } = req.params;

        const user = await User.findById(req.userId);
        if (!user) {
            throw new NotFoundError('Пользователь не найден');
        }

        const itemIndex = user.cart.findIndex(
            item => item.food.toString() === foodId
        );

        if (itemIndex === -1) {
            throw new NotFoundError('Товар не найден в корзине');
        }

        user.cart.splice(itemIndex, 1);

        await user.save();
        await user.populate('cart.food');

        res.json({ message: 'Товар удален из корзины', cart: user.cart });
    } catch (error) {
        next(error);
    }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            throw new NotFoundError('Пользователь не найден');
        }

        user.cart.splice(0, user.cart.length);
        await user.save();
        await user.populate('cart.food');

        res.json({ message: 'Корзина очищена', cart: user.cart });
    } catch (error) {
        next(error);
    }
};
