import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/unauthorized.js";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken;
        
        if (!token) {
            throw new UnauthorizedError('Недействительный токен');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { 
            userId: string; 
            role: 'admin' | 'worker';
            location?: 'шатой' | 'гикало';
        };
        res.locals.userId = decoded.userId;
        res.locals.userRole = decoded.role;
        res.locals.userLocation = decoded.location;
        next();
    } catch (error) {
        next(new UnauthorizedError('Недействительный токен'));
    }
};
