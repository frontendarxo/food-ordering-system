import type { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import { AppError } from "../errors/app-error.js";

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {


    if (err instanceof Error.ValidationError) {
        return res.status(400).json({
            message: Object.values(err.errors)
                .map(e => e.message)
                .join(', ')
        });
    }
    if (err instanceof AppError) {      
        return res.status(err.statusCode).json({ message: err.message });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
}