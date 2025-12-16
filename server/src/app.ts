import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
    console.error('ОШИБКА: JWT_SECRET не установлен в переменных окружения');
    process.exit(1);
}

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { handleError } from './middlewares/handleError.js';
import router from './routers/index.js';

const app = express();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        const mongoURL = process.env.MONGODB_URL || 'mongodb://localhost:27017/qatar-project';
        await mongoose.connect(mongoURL);
        console.log('MongoDB подключена успешно');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error);
        process.exit(1);
    }
};

connectDB();

app.use(router);

app.use(handleError);

const PORT = process.env.PORT || '3000';

app.listen(parseInt(PORT), () => {
  console.log(`Server is running on port ${PORT}`);
});