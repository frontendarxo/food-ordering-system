import type { NextFunction, Response } from "express";
import mongoose from "mongoose";
import User from "../modules/userSchema.js";
import Order from "../modules/orderSchema.js";
import Food from "../modules/FoodSchema.js";
import type { AuthRequest } from "../middlewares/auth.js";
import { NotFoundError } from "../errors/notFoundError.js";

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Пользователь не авторизован' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (user.cart.length === 0) {
            return res.status(400).json({ message: 'Корзина пуста' });
        }

        const foodIds = user.cart.map(item => item.food);
        const foods = await Food.find({ _id: { $in: foodIds } });

        const foodMap = new Map(foods.map(food => [food._id.toString(), food]));

        const orderItems = user.cart.map(cartItem => {
            const food = foodMap.get(cartItem.food.toString());
            if (!food) {
                throw new NotFoundError(`Еда с ID ${cartItem.food} не найдена`);
            }
            return {
                food: cartItem.food,
                quantity: cartItem.quantity,
                price: food.price
            };
        });

        const total = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const order = new Order({
            user: new mongoose.Types.ObjectId(req.userId),
            items: orderItems,
            total
        });
        await order.save();

        user.cart.splice(0, user.cart.length);
        await user.save();

        await order.populate('items.food');
        await order.populate('user', 'name number');

        res.status(201).json({ 
            message: 'Заказ создан успешно', 
            order 
        });
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate('items.food')
            .sort({ createdAt: -1 });

        res.json({ orders });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ 
            _id: orderId, 
            user: req.userId 
        })
            .populate('items.food')
            .populate('user', 'name number');

        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        res.json({ order });
    } catch (error) {
        next(error);
    }
};
