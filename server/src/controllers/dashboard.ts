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
    if (res.locals.userRole !== 'worker') {
      throw new UnauthorizedError('Доступ только для сотрудника');
    }
    const location = res.locals.userLocation;
    if (!location) {
      throw new UnauthorizedError('Локация не указана');
    }
    const data = await getWorkerDashboard(location);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
