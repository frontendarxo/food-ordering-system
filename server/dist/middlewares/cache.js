var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getCacheKey, getCachedData, setCachedData } from '../utils/cache.js';
export const cacheMiddleware = (ttl = 3600) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.method !== 'GET') {
            return next();
        }
        const cacheKey = getCacheKey(req);
        const cachedData = yield getCachedData(cacheKey);
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            const responseData = JSON.stringify(body);
            setCachedData(cacheKey, responseData, ttl);
            return originalJson(body);
        };
        next();
    });
};
