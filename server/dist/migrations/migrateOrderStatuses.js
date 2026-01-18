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
import mongoose from 'mongoose';
import Order from '../modules/orderSchema.js';
const migrateOrderStatuses = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/qatar-project';
        yield mongoose.connect(mongoUri);
        console.log('Подключено к MongoDB');
        const oldStatuses = ['preparing', 'ready', 'delivered'];
        const newStatus = 'confirmed';
        const result = yield Order.updateMany({ status: { $in: oldStatuses } }, {
            $set: {
                status: newStatus,
                statusChangedAt: new Date()
            }
        });
        console.log(`Миграция завершена. Обновлено заказов: ${result.modifiedCount}`);
        yield mongoose.disconnect();
        console.log('Отключено от MongoDB');
    }
    catch (error) {
        console.error('Ошибка миграции:', error);
        process.exit(1);
    }
});
migrateOrderStatuses();
