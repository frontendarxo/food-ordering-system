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
import { optimizeImage } from "../utils/imageOptimizer.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
        const userRole = res.locals.userRole;
        const userLocation = res.locals.userLocation;
        const foods = yield Food.find();
        // Работники видят только блюда своего центра с актуальным статусом наличия
        if (userRole === 'worker' && userLocation) {
            const filteredFoods = foods
                .filter(food => food.locations && food.locations.includes(userLocation))
                .map(food => {
                var _a, _b;
                const foodObj = food.toObject();
                // Конвертируем Map в простой объект
                if (food.stockByLocation) {
                    const stockByLocationObj = {};
                    food.stockByLocation.forEach((value, key) => {
                        stockByLocationObj[key] = value;
                    });
                    foodObj.stockByLocation = stockByLocationObj;
                }
                // Подменяем глобальный inStock на статус конкретного центра
                foodObj.inStock = (_b = (_a = food.stockByLocation) === null || _a === void 0 ? void 0 : _a.get(userLocation)) !== null && _b !== void 0 ? _b : true;
                return foodObj;
            });
            res.status(200).json({ foods: filteredFoods });
        }
        else {
            // Для админа тоже конвертируем Map
            const serializedFoods = foods.map(food => {
                const foodObj = food.toObject();
                if (food.stockByLocation) {
                    const stockByLocationObj = {};
                    food.stockByLocation.forEach((value, key) => {
                        stockByLocationObj[key] = value;
                    });
                    foodObj.stockByLocation = stockByLocationObj;
                }
                return foodObj;
            });
            res.status(200).json({ foods: serializedFoods });
        }
    }
    catch (error) {
        next(error);
    }
});
export const getFoodByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const userRole = res.locals.userRole;
        const userLocation = res.locals.userLocation;
        const foods = yield Food.find({ category: category });
        // Работники видят только блюда своего центра с актуальным статусом наличия
        if (userRole === 'worker' && userLocation) {
            const filteredFoods = foods
                .filter(food => food.locations && food.locations.includes(userLocation))
                .map(food => {
                var _a, _b;
                const foodObj = food.toObject();
                // Конвертируем Map в простой объект
                if (food.stockByLocation) {
                    const stockByLocationObj = {};
                    food.stockByLocation.forEach((value, key) => {
                        stockByLocationObj[key] = value;
                    });
                    foodObj.stockByLocation = stockByLocationObj;
                }
                // Подменяем глобальный inStock на статус конкретного центра
                foodObj.inStock = (_b = (_a = food.stockByLocation) === null || _a === void 0 ? void 0 : _a.get(userLocation)) !== null && _b !== void 0 ? _b : true;
                return foodObj;
            });
            res.status(200).json({ foods: filteredFoods });
        }
        else {
            // Для админа тоже конвертируем Map
            const serializedFoods = foods.map(food => {
                const foodObj = food.toObject();
                if (food.stockByLocation) {
                    const stockByLocationObj = {};
                    food.stockByLocation.forEach((value, key) => {
                        stockByLocationObj[key] = value;
                    });
                    foodObj.stockByLocation = stockByLocationObj;
                }
                return foodObj;
            });
            res.status(200).json({ foods: serializedFoods });
        }
    }
    catch (error) {
        next(error);
    }
});
export const createFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdmin(res.locals.userRole);
        const { name, price, category, inStock, locations } = req.body;
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
        // Оптимизируем изображение
        const fullImagePath = path.join(__dirname, '../../uploads/images', file.filename);
        yield optimizeImage(fullImagePath);
        // Парсим locations из JSON строки
        let parsedLocations = ['шатой', 'гикало'];
        if (locations) {
            try {
                parsedLocations = typeof locations === 'string' ? JSON.parse(locations) : locations;
            }
            catch (_a) {
                parsedLocations = ['шатой', 'гикало'];
            }
        }
        if (!Array.isArray(parsedLocations) || parsedLocations.length === 0) {
            throw new BadRequestError('Выберите хотя бы один центр');
        }
        const imagePath = `/uploads/images/${file.filename}`;
        const initialStock = inStock !== undefined ? (inStock === 'true' || inStock === true) : true;
        // Создаем stockByLocation только для выбранных локаций
        const stockByLocationMap = new Map();
        parsedLocations.forEach(location => {
            if (location === 'шатой' || location === 'гикало') {
                stockByLocationMap.set(location, initialStock);
            }
        });
        const food = new Food({
            name: name.trim(),
            price: parsedPrice,
            category: category.trim(),
            image: imagePath,
            inStock: initialStock,
            locations: parsedLocations,
            stockByLocation: stockByLocationMap
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
    var _a, _b;
    try {
        requireAdminOrWorker(res.locals.userRole);
        const { id } = req.params;
        const { inStock, location: targetLocation } = req.body;
        const userRole = res.locals.userRole;
        const userLocation = res.locals.userLocation;
        if (typeof inStock !== 'boolean') {
            throw new BadRequestError('inStock должен быть булевым значением');
        }
        let food = yield Food.findById(id);
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }
        if (!food.stockByLocation) {
            food.stockByLocation = new Map();
        }
        let updateData = {};
        // Работник обновляет наличие только для своего центра
        if (userRole === 'worker' && userLocation) {
            food.stockByLocation.set(userLocation, inStock);
            // Обновляем глобальный inStock: true только если хоть в одном центре есть в наличии
            const hasStockAnywhere = Array.from(food.stockByLocation.values()).some(stock => stock === true);
            updateData = {
                [`stockByLocation.${userLocation}`]: inStock,
                inStock: hasStockAnywhere
            };
        }
        // Админ может обновлять конкретный центр или все сразу
        else if (userRole === 'admin') {
            if (targetLocation && (targetLocation === 'шатой' || targetLocation === 'гикало')) {
                // Админ обновляет конкретный центр
                food.stockByLocation.set(targetLocation, inStock);
                // Обновляем глобальный inStock
                const hasStockAnywhere = Array.from(food.stockByLocation.values()).some(stock => stock === true);
                updateData = {
                    [`stockByLocation.${targetLocation}`]: inStock,
                    inStock: hasStockAnywhere
                };
            }
            else {
                // Админ обновляет все центры сразу (кнопка "Переключить все")
                updateData = {
                    'stockByLocation.шатой': inStock,
                    'stockByLocation.гикало': inStock,
                    inStock: inStock
                };
            }
        }
        // Используем findByIdAndUpdate для обновления без полной валидации
        food = yield Food.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: false });
        yield invalidateFoodCache();
        if (food) {
            // Преобразуем Map в обычный объект для JSON
            const foodObj = food.toObject();
            // Конвертируем Map в простой объект
            if (food.stockByLocation) {
                const stockByLocationObj = {};
                food.stockByLocation.forEach((value, key) => {
                    stockByLocationObj[key] = value;
                });
                foodObj.stockByLocation = stockByLocationObj;
            }
            // Для работника подменяем inStock на статус его центра
            if (userRole === 'worker' && userLocation) {
                foodObj.inStock = (_b = (_a = food.stockByLocation) === null || _a === void 0 ? void 0 : _a.get(userLocation)) !== null && _b !== void 0 ? _b : true;
            }
            res.status(200).json({ food: foodObj });
        }
        else {
            res.status(200).json({ food: null });
        }
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
        // Оптимизируем изображение
        const fullImagePath = path.join(__dirname, '../../uploads/images', file.filename);
        yield optimizeImage(fullImagePath);
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
