import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorized.js';
import { getAdminDashboard, getWorkerDashboard } from '../services/analyticsService.js';

export const getAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (res.locals.userRole !== 'admin') {
      throw new UnauthorizedError('Доступ только для администратора');
    }
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
    const data = await getAdminDashboard({ startDate, endDate });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (res.locals.userRole !== 'worker' || !res.locals.userLocation) {
      throw new UnauthorizedError('Доступ только для работника с назначенной локацией');
    }
    const data = await getWorkerDashboard(res.locals.userLocation);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
