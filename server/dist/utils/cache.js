var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import redisClient from './redis.js';
const DEFAULT_TTL = 3600;
export const getCacheKey = (req) => {
    const baseUrl = req.originalUrl || req.url;
    return `cache:${baseUrl}`;
};
export const getCachedData = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!redisClient.isOpen) {
            return null;
        }
        return yield redisClient.get(key);
    }
    catch (error) {
        console.error('Ошибка получения кэша:', error);
        return null;
    }
});
export const setCachedData = (key_1, data_1, ...args_1) => __awaiter(void 0, [key_1, data_1, ...args_1], void 0, function* (key, data, ttl = DEFAULT_TTL) {
    try {
        if (!redisClient.isOpen) {
            return;
        }
        yield redisClient.setEx(key, ttl, data);
    }
    catch (error) {
        console.error('Ошибка сохранения в кэш:', error);
    }
});
export const invalidateCache = (pattern) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!redisClient.isOpen) {
            return;
        }
        const keys = yield redisClient.keys(pattern);
        if (keys.length > 0) {
            yield redisClient.del(keys);
        }
    }
    catch (error) {
        console.error('Ошибка инвалидации кэша:', error);
    }
});
export const invalidateFoodCache = () => __awaiter(void 0, void 0, void 0, function* () {
    yield invalidateCache('cache:/foods*');
});
export const invalidateOrderCache = () => __awaiter(void 0, void 0, void 0, function* () {
    yield invalidateCache('cache:/orders*');
});
