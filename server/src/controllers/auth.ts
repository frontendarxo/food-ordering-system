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
  const workerShatoyLogin = process.env.WORKER_SHATOY_LOGIN;
  const workerShatoyPassword = process.env.WORKER_SHATOY_PASSWORD;
  const workerGikaloLogin = process.env.WORKER_GIKALO_LOGIN;
  const workerGikaloPassword = process.env.WORKER_GIKALO_PASSWORD;

  if (!adminLogin || !adminPassword || !workerShatoyLogin || !workerShatoyPassword || !workerGikaloLogin || !workerGikaloPassword) {
    throw new Error('Учетные данные не настроены в переменных окружения');
  }

  let role: 'admin' | 'worker' | null = null;
  let location: 'шатой' | 'гикало' | undefined = undefined;

  if (username === adminLogin && password === adminPassword) {
    role = 'admin';
  } else if (username === workerShatoyLogin && password === workerShatoyPassword) {
    role = 'worker';
    location = 'шатой';
  } else if (username === workerGikaloLogin && password === workerGikaloPassword) {
    role = 'worker';
    location = 'гикало';
  } else {
    throw new UnauthorizedError('Неверный логин или пароль');
  }

  const token = jwt.sign(
    { userId: username, role, location },
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
    user: { role, location },
  });
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.json({ success: true });
};

export const me = async (req: Request, res: Response) => {
  const userRole = res.locals.userRole;
  const userId = res.locals.userId;
  const userLocation = res.locals.userLocation;
  
  if (!userRole || !userId) {
    throw new UnauthorizedError('Пользователь не аутентифицирован');
  }

  res.json({ user: { role: userRole, location: userLocation } });
};

