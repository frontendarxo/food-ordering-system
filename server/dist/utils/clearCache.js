var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import 'dotenv/config';
import { clearAllCache } from './cache.js';
import redisClient from './redis.js';
const clearCache = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Очистка кеша...');
        yield clearAllCache();
        console.log('Кеш успешно очищен!');
        yield redisClient.quit();
        process.exit(0);
    }
    catch (error) {
        console.error('Ошибка при очистке кеша:', error);
        process.exit(1);
    }
});
clearCache();
