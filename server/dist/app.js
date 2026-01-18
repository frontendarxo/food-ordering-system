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
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!process.env.JWT_SECRET) {
    console.error('ОШИБКА: JWT_SECRET не установлен в переменных окружения');
    process.exit(1);
}
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { handleError } from './middlewares/handleError.js';
import router from './routers/index.js';
import './utils/redis.js';
const app = express();
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
};
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('x-powered-by', 'Ruby on Rails');
    next();
});
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // MongoDB connection URI with authentication support
        // Format: mongodb://[username]:[password]@[host]:[port]/[database]?authSource=admin
        // For Docker: use 'mongodb' as hostname when running in same network
        // For local: use 'localhost' as hostname
        const mongoURL = process.env.MONGODB_URL || 'mongodb://localhost:27017/qatar-project';
        const connectionOptions = {
            // Connection options for better reliability
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        yield mongoose.connect(mongoURL, connectionOptions);
        console.log('MongoDB подключена успешно');
    }
    catch (error) {
        console.error('Ошибка подключения к MongoDB:', error);
        process.exit(1);
    }
});
connectDB();
app.use(router);
app.use(handleError);
const PORT = process.env.PORT || '3000';
app.listen(parseInt(PORT), () => {
    console.log(`Server is running on port ${PORT}`);
});
