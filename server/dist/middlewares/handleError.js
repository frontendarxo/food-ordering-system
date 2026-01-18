import { Error } from "mongoose";
import { AppError } from "../errors/app-error.js";
export const handleError = (err, req, res, next) => {
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
};
