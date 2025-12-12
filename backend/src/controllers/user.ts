import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modules/userSchema.js";
import { JWT_SECRET } from "../utils/jwt.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, number, password } = req.body;
        
        if (!name || !number || !password) {
            return res.status(400).json({ message: 'Все поля обязательны' });
        }

        const existingUser = await User.findOne({ number });
        if (existingUser) {
            return res.status(409).json({ message: 'Пользователь с таким номером уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, number, password: hashedPassword });
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ 
            message: 'Пользователь успешно зарегистрирован', 
            token,
            user: { id: user._id, name: user.name, number: user.number }
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { number, password } = req.body;
        
        if (!number || !password) {
            return res.status(400).json({ message: 'Номер и пароль обязательны' });
        }

        const user = await User.findOne({ number });
        if (!user) {
            return res.status(401).json({ message: 'Неверный номер или пароль' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный номер или пароль' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            message: 'Успешный вход',
            token,
            user: { id: user._id, name: user.name, number: user.number }
        });
    } catch (error) {
        next(error);
    }
};