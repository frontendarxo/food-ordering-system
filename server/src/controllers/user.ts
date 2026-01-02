import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../modules/userSchema.js";
import { BadRequestError } from "../errors/bad-request.js";
import { ConflictError } from "../errors/conflict.js";
import { UnauthorizedError } from "../errors/unauthorized.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, number, password } = req.body;
        if (!name || !number || !password) {
            return next(new BadRequestError('Все поля обязательны'))
        }
        
        const numberStr = String(number).replace(/\D/g, '');
        if (numberStr.length !== 11 || !numberStr.startsWith('8')) {
            return next(new BadRequestError('Номер должен содержать 11 цифр и начинаться с 8'))
        }
        
        const numberValue = Number(numberStr);
        if (isNaN(numberValue)) {
            return next(new BadRequestError('Некорректный номер'))
        }
        
        if (name.length < 4) {
            return next(new BadRequestError('Имя должно быть не менее 4 символов'))
        }
        
        if (password.length < 6) {
            return next(new BadRequestError('Пароль должен быть не менее 6 символов'))
        }
        
        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
        if (!passwordRegex.test(password)) {
            return next(new BadRequestError('Пароль должен содержать только английские символы'))
        }
        
        const existingUser = await User.findOne({ number: numberValue });
        if (existingUser) {
            return next(new ConflictError('Пользователь с таким номером уже существует'))
        }
        
        const user = await User.create({ name, number: numberValue, password });
        const token = user.generateAuthToken();

        res.status(201)
        .cookie('accessToken', token, { 
            httpOnly: true, 
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        })
        .json({ 
            message: 'Пользователь успешно зарегистрирован', 
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
            return next(new BadRequestError('Номер и пароль обязательны'))
        }
        
        const numberStr = String(number).replace(/\D/g, '');
        if (numberStr.length !== 11 || !numberStr.startsWith('8')) {
            return next(new BadRequestError('Номер должен содержать 11 цифр и начинаться с 8'))
        }
        
        const numberValue = Number(numberStr);
        if (isNaN(numberValue)) {
            return next(new BadRequestError('Некорректный номер'))
        }
        
        const user = await User.findByCredentials(numberValue, password);
        const token = user.generateAuthToken();
        res
        .cookie('accessToken', token, { 
            httpOnly: true, 
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        })
        .json({ 
            message: 'Успешный вход',
            user: { id: user._id, name: user.name, number: user.number }
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = res.locals.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return next(new UnauthorizedError('Пользователь не найден'));
        }
        
        res.json({ 
            user: { id: user._id, name: user.name, number: user.number }
        });
    } catch (error) {
        next(error);
    }
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: 'lax',
        })
        .json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        next(error);
    }
};

export const updateUserName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = res.locals.userId;
        const { name } = req.body;
        
        if (!name) {
            return next(new BadRequestError('Имя обязательно'));
        }
        
        if (name.length < 4) {
            return next(new BadRequestError('Имя должно быть не менее 4 символов'));
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { name },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return next(new UnauthorizedError('Пользователь не найден'));
        }
        
        res.json({
            message: 'Имя успешно обновлено',
            user: { id: user._id, name: user.name, number: user.number }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = res.locals.userId;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return next(new BadRequestError('Текущий и новый пароль обязательны'));
        }
        
        if (newPassword.length < 6) {
            return next(new BadRequestError('Пароль должен быть не менее 6 символов'));
        }
        
        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
        if (!passwordRegex.test(newPassword)) {
            return next(new BadRequestError('Пароль должен содержать только английские символы'));
        }
        
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return next(new UnauthorizedError('Пользователь не найден'));
        }
        
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return next(new UnauthorizedError('Неверный текущий пароль'));
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({
            message: 'Пароль успешно обновлен',
            user: { id: user._id, name: user.name, number: user.number }
        });
    } catch (error) {
        next(error);
    }
};