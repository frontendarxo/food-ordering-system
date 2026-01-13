import type { Request, Response, NextFunction } from 'express';
import redisClient from './redis.js';

const DEFAULT_TTL = 3600;

export const getCacheKey = (req: Request): string => {
  const baseUrl = req.originalUrl || req.url;
  return `cache:${baseUrl}`;
};

export const getCachedData = async (key: string): Promise<string | null> => {
  try {
    if (!redisClient.isOpen) {
      return null;
    }
    return await redisClient.get(key);
  } catch (error) {
    console.error('Ошибка получения кэша:', error);
    return null;
  }
};

export const setCachedData = async (
  key: string,
  data: string,
  ttl: number = DEFAULT_TTL
): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      return;
    }
    await redisClient.setEx(key, ttl, data);
  } catch (error) {
    console.error('Ошибка сохранения в кэш:', error);
  }
};

export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      return;
    }
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Ошибка инвалидации кэша:', error);
  }
};

export const invalidateFoodCache = async (): Promise<void> => {
  await invalidateCache('cache:/foods*');
};

export const invalidateOrderCache = async (): Promise<void> => {
  await invalidateCache('cache:/orders*');
};

