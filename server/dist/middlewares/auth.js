var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/unauthorized.js";
export const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            throw new UnauthorizedError('Недействительный токен');
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        res.locals.userId = decoded.userId;
        res.locals.userRole = decoded.role;
        next();
    }
    catch (error) {
        next(new UnauthorizedError('Недействительный токен'));
    }
});
