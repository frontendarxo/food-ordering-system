import type { Request, Response, NextFunction } from 'express';
import { getCacheKey, getCachedData, setCachedData } from '../utils/cache.js';

export const cacheMiddleware = (ttl: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = getCacheKey(req);
    const cachedData = await getCachedData(cacheKey);

    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      const responseData = JSON.stringify(body);
      setCachedData(cacheKey, responseData, ttl);
      return originalJson(body);
    };

    next();
  };
};

