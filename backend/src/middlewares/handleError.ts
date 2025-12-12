import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError.js";

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    // Check for mongoose ValidationError type properly
    if ((err as any)?.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    if (err instanceof AppError) {      
        return res.status(err.statusCode).json({ message: err.message });
    }
    res.status(500).json({ message: 'Something broke!' });
}