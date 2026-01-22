var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import Food from '../modules/FoodSchema.js';
// Загружаем переменные окружения
config();
/**
 * Миграция для добавления полей locations и stockByLocation к существующим блюдам
 */
export const migrateAddLocationFields = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Начинаем миграцию: добавление полей локаций...');
        const foods = yield Food.find({});
        let updatedCount = 0;
        for (const food of foods) {
            let needsUpdate = false;
            // Добавляем locations если его нет
            if (!food.locations || food.locations.length === 0) {
                food.locations = ['шатой', 'гикало'];
                needsUpdate = true;
            }
            // Добавляем stockByLocation если его нет
            if (!food.stockByLocation || food.stockByLocation.size === 0) {
                const currentStock = (_a = food.inStock) !== null && _a !== void 0 ? _a : true;
                food.stockByLocation = new Map([
                    ['шатой', currentStock],
                    ['гикало', currentStock]
                ]);
                needsUpdate = true;
            }
            if (needsUpdate) {
                yield food.save();
                updatedCount++;
            }
        }
        console.log(`✅ Миграция завершена. Обновлено блюд: ${updatedCount} из ${foods.length}`);
    }
    catch (error) {
        console.error('❌ Ошибка миграции:', error);
        throw error;
    }
});
// Запуск миграции, если файл вызван напрямую
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) {
        console.error('❌ MONGODB_URL не определен в переменных окружения');
        process.exit(1);
    }
    mongoose.connect(MONGODB_URL)
        .then(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('📦 Подключено к MongoDB');
        yield migrateAddLocationFields();
        yield mongoose.disconnect();
        console.log('✅ Отключено от MongoDB');
        process.exit(0);
    }))
        .catch((error) => {
        console.error('❌ Ошибка подключения к MongoDB:', error);
        process.exit(1);
    });
}
