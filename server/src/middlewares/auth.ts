import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/unauthorized.js";

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: 'admin' | 'worker';
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken;
        
        if (!token) {
            throw new UnauthorizedError('Недействительный токен');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'admin' | 'worker' };
        res.locals.userId = decoded.userId;
        res.locals.userRole = decoded.role;
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        throw new UnauthorizedError('Недействительный токен');
    }
};
