import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';
import { UnauthorizedError } from '../errors/unauthorized.js';

interface LoginRequest {
  login: string;
  password: string;
}

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const { login: username, password } = req.body;

  if (!username || !password) {
    throw new UnauthorizedError('Логин и пароль обязательны');
  }

  const adminLogin = process.env.ADMIN_LOGIN;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const workerLogin = process.env.WORKER_LOGIN;
  const workerPassword = process.env.WORKER_PASSWORD;

  if (!adminLogin || !adminPassword || !workerLogin || !workerPassword) {
    throw new Error('Учетные данные не настроены в переменных окружения');
  }

  let role: 'admin' | 'worker' | null = null;

  if (username === adminLogin && password === adminPassword) {
    role = 'admin';
  } else if (username === workerLogin && password === workerPassword) {
    role = 'worker';
  } else {
    throw new UnauthorizedError('Неверный логин или пароль');
  }

  const token = jwt.sign(
    { userId: username, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    user: { role },
  });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.json({ success: true });
};

export const me = async (req: Request, res: Response) => {
  const userRole = res.locals.userRole;
  const userId = res.locals.userId;
  
  if (!userRole || !userId) {
    throw new UnauthorizedError('Пользователь не аутентифицирован');
  }

  res.json({ user: { role: userRole } });
};

