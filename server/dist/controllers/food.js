var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Food from "../modules/FoodSchema.js";
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";
import { UnauthorizedError } from "../errors/unauthorized.js";
import { invalidateFoodCache } from "../utils/cache.js";
const requireAdmin = (userRole) => {
    if (userRole !== 'admin') {
        throw new UnauthorizedError('Только администратор может выполнять эту операцию');
    }
};
const requireAdminOrWorker = (userRole) => {
    if (userRole !== 'admin' && userRole !== 'worker') {
        throw new UnauthorizedError('Только администратор или работник могут выполнять эту операцию');
    }
};
export const getAllFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foods = yield Food.find();
        res.status(200).json({ foods });
    }
    catch (error) {
        next(error);
    }
});
export const getFoodByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const foods = yield Food.find({ category: category });
        res.status(200).json({ foods });
    }
    catch (error) {
        next(error);
    }
});
export const createFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { name, price, category, inStock } = req.body;
        const file = req.file;
        if (!name || !price || !category) {
            throw new BadRequestError('Все поля обязательны для заполнения');
        }
        const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (typeof parsedPrice !== 'number' || parsedPrice <= 0 || isNaN(parsedPrice)) {
            throw new BadRequestError('Цена должна быть положительным числом');
        }
        if (!file) {
            throw new BadRequestError('Изображение обязательно');
        }
        const imagePath = `/uploads/images/${file.filename}`;
        const food = new Food({
            name: name.trim(),
            price: parsedPrice,
            category: category.trim(),
            image: imagePath,
            inStock: inStock !== undefined ? (inStock === 'true' || inStock === true) : true
        });
        yield food.save();
        yield invalidateFoodCache();
        res.status(201).json({ food });
    }
    catch (error) {
        next(error);
    }
});
export const updateFoodPrice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { id } = req.params;
        const { price } = req.body;
        if (!price || typeof price !== 'number' || price <= 0) {
            throw new BadRequestError('Цена должна быть положительным числом');
        }
        const food = yield Food.findByIdAndUpdate(id, { price }, { new: true });
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }
        yield invalidateFoodCache();
        res.status(200).json({ food });
    }
    catch (error) {
        next(error);
    }
});
export const updateFoodStock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdminOrWorker(res.locals.userRole);
        const { id } = req.params;
        const { inStock } = req.body;
        if (typeof inStock !== 'boolean') {
            throw new BadRequestError('inStock должен быть булевым значением');
        }
        const food = yield Food.findByIdAndUpdate(id, { inStock }, { new: true });
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }
        yield invalidateFoodCache();
        res.status(200).json({ food });
    }
    catch (error) {
        next(error);
    }
});
export const updateFoodName = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { id } = req.params;
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название обязательно и должно быть непустой строкой');
        }
        const food = yield Food.findByIdAndUpdate(id, { name: name.trim() }, { new: true });
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }
        yield invalidateFoodCache();
        res.status(200).json({ food });
    }
    catch (error) {
        next(error);
    }
});
export const updateFoodImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { id } = req.params;
        const file = req.file;
        if (!file) {
            throw new BadRequestError('Изображение обязательно');
        }
        const food = yield Food.findById(id);
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }
        const imagePath = `/uploads/images/${file.filename}`;
        const updatedFood = yield Food.findByIdAndUpdate(id, { image: imagePath }, { new: true });
        yield invalidateFoodCache();
        res.status(200).json({ food: updatedFood });
    }
    catch (error) {
        next(error);
    }
});
export const deleteFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { id } = req.params;
        const food = yield Food.findByIdAndDelete(id);
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }
        yield invalidateFoodCache();
        res.status(200).json({ message: 'Еда удалена успешно' });
    }
    catch (error) {
        next(error);
    }
});
