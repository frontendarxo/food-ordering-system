import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../modules/orderSchema.js';

const migrateOrderStatuses = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/qatar-project';
    await mongoose.connect(mongoUri);
    console.log('Подключено к MongoDB');

    const oldStatuses = ['preparing', 'ready', 'delivered'];
    const newStatus = 'confirmed';

    const result = await Order.updateMany(
      { status: { $in: oldStatuses } },
      { 
        $set: { 
          status: newStatus,
          statusChangedAt: new Date()
        } 
      }
    );

    console.log(`Миграция завершена. Обновлено заказов: ${result.modifiedCount}`);

    await mongoose.disconnect();
    console.log('Отключено от MongoDB');
  } catch (error) {
    console.error('Ошибка миграции:', error);
    process.exit(1);
  }
};

migrateOrderStatuses();

