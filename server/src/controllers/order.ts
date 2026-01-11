import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../modules/orderSchema.js";
import Food from "../modules/FoodSchema.js";
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";

interface OrderItem {
    food: string;
    quantity: number;
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phoneNumber, items, deliveryMethod, address, paymentMethod } = req.body;
        
        if (!phoneNumber) {
            throw new BadRequestError('Номер телефона обязателен');
        }

        const numberStr = String(phoneNumber).replace(/\D/g, '');
        if (numberStr.length !== 11 || !numberStr.startsWith('8')) {
            throw new BadRequestError('Номер должен содержать 11 цифр и начинаться с 8');
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestError('Корзина пуста');
        }

        if (!deliveryMethod || !['самовызов', 'доставка'].includes(deliveryMethod)) {
            throw new BadRequestError('Метод получения обязателен');
        }

        if (deliveryMethod === 'доставка' && (!address || address.trim().length < 5)) {
            throw new BadRequestError('Адрес обязателен для доставки и должен быть не менее 5 символов');
        }

        if (!paymentMethod || !['наличка', 'карта'].includes(paymentMethod)) {
            throw new BadRequestError('Метод оплаты обязателен');
        }

        const foodIds = items.map((item: OrderItem) => item.food);
        const foods = await Food.find({ _id: { $in: foodIds } });

        const foodMap = new Map(foods.map(food => [food._id.toString(), food]));

        const orderItems = items.map((cartItem: OrderItem) => {
            const food = foodMap.get(cartItem.food);
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

        const orderData: any = {
            phoneNumber: numberStr,
            items: orderItems,
            total,
            deliveryMethod,
            paymentMethod
        };

        if (deliveryMethod === 'delivery') {
            orderData.address = address.trim();
        }

        const order = new Order(orderData);
        await order.save();

        await order.populate('items.food');

        res.status(201).json({ 
            message: 'Заказ создан успешно', 
            order 
        });
    } catch (error) {
        next(error);
    }
};
