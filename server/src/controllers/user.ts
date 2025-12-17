import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../modules/userSchema.js";
import { JWT_SECRET } from "../utils/jwt.js";
import { BadRequestError } from "../errors/bad-request.js";
import { ConflictError } from "../errors/conflict.js";
import { UnauthorizedError } from "../errors/unauthorized.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, number, password, adress } = req.body;
        
        if (!name || !number || !password || !adress) {
            throw new BadRequestError('Все поля обязательны');
        }

        if (name.length < 4 || number.length < 11 || password.length < 6) {
            throw new BadRequestError('Некорректные данные');
        }

        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
        if (!passwordRegex.test(password)) {
            throw new BadRequestError('Пароль должен содержать только английские символы');
        }

        const existingUser = await User.findOne({ number });
        if (existingUser) {
            throw new ConflictError('Пользователь с таким номером уже существует');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, number, password: hashedPassword, adress });
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
            throw new BadRequestError('Номер и пароль обязательны');
        }

        const user = await User.findOne({ number });
        if (!user) {
            throw new UnauthorizedError('Неверный номер или пароль');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Неверный номер или пароль');
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