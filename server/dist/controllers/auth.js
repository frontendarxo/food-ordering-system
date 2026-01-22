var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';
import { UnauthorizedError } from '../errors/unauthorized.js';
export const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { login: username, password } = req.body;
    if (!username || !password) {
        throw new UnauthorizedError('Логин и пароль обязательны');
    }
    const adminLogin = process.env.ADMIN_LOGIN;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const workerShatoyLogin = process.env.WORKER_SHATOY_LOGIN;
    const workerShatoyPassword = process.env.WORKER_SHATOY_PASSWORD;
    const workerGikaloLogin = process.env.WORKER_GIKALO_LOGIN;
    const workerGikaloPassword = process.env.WORKER_GIKALO_PASSWORD;
    if (!adminLogin || !adminPassword || !workerShatoyLogin || !workerShatoyPassword || !workerGikaloLogin || !workerGikaloPassword) {
        throw new Error('Учетные данные не настроены в переменных окружения');
    }
    let role = null;
    let location = undefined;
    if (username === adminLogin && password === adminPassword) {
        role = 'admin';
    }
    else if (username === workerShatoyLogin && password === workerShatoyPassword) {
        role = 'worker';
        location = 'шатой';
    }
    else if (username === workerGikaloLogin && password === workerGikaloPassword) {
        role = 'worker';
        location = 'гикало';
    }
    else {
        throw new UnauthorizedError('Неверный логин или пароль');
    }
    const token = jwt.sign({ userId: username, role, location }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
        success: true,
        user: { role, location },
    });
});
export const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('accessToken');
    res.json({ success: true });
});
export const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRole = res.locals.userRole;
    const userId = res.locals.userId;
    const userLocation = res.locals.userLocation;
    if (!userRole || !userId) {
        throw new UnauthorizedError('Пользователь не аутентифицирован');
    }
    res.json({ user: { role: userRole, location: userLocation } });
});
