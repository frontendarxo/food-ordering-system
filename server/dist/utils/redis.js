var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from 'redis';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({
    url: REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.warn('⚠️ Redis: Превышено количество попыток подключения. Redis будет недоступен.');
                return false;
            }
            return Math.min(retries * 100, 3000);
        },
    },
});
redisClient.on('error', (err) => {
    if (err.message.includes('ENOTFOUND')) {
        console.warn('⚠️ Redis: Не удалось найти хост Redis. Проверьте REDIS_URL в .env файле.');
        console.warn(`   Текущий URL: ${REDIS_URL}`);
        console.warn('   Для локальной разработки используйте: redis://localhost:6379');
    }
    else {
        console.error('Redis Client Error:', err.message);
    }
});
redisClient.on('connect', () => {
    console.log('✅ Redis подключен успешно');
});
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!redisClient.isOpen) {
            yield redisClient.connect();
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('ENOTFOUND')) {
            console.warn('⚠️ Redis недоступен. Кэширование будет отключено.');
            console.warn('   Убедитесь, что Redis запущен или измените REDIS_URL в .env');
        }
        else {
            console.error('Ошибка подключения к Redis:', errorMessage);
        }
    }
});
connectRedis();
export default redisClient;
