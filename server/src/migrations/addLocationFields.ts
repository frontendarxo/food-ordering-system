import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import Food from '../modules/FoodSchema.js';

// Загружаем переменные окружения
config();

/**
 * Миграция для добавления полей locations и stockByLocation к существующим блюдам
 */
export const migrateAddLocationFields = async () => {
  try {
    console.log('Начинаем миграцию: добавление полей локаций...');

    const foods = await Food.find({});
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
        const currentStock = food.inStock ?? true;
        food.stockByLocation = new Map([
          ['шатой', currentStock],
          ['гикало', currentStock]
        ]);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await food.save();
        updatedCount++;
      }
    }

    console.log(`✅ Миграция завершена. Обновлено блюд: ${updatedCount} из ${foods.length}`);
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    throw error;
  }
};

// Запуск миграции, если файл вызван напрямую
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  const MONGODB_URL = process.env.MONGODB_URL;
  
  if (!MONGODB_URL) {
    console.error('❌ MONGODB_URL не определен в переменных окружения');
    process.exit(1);
  }

  mongoose.connect(MONGODB_URL)
    .then(async () => {
      console.log('📦 Подключено к MongoDB');
      await migrateAddLocationFields();
      await mongoose.disconnect();
      console.log('✅ Отключено от MongoDB');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка подключения к MongoDB:', error);
      process.exit(1);
    });
}
