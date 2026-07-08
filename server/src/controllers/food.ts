import type { NextFunction, Request, Response } from "express"
import Food from "../modules/FoodSchema.js"
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";
import { UnauthorizedError } from "../errors/unauthorized.js";
import { invalidateFoodCache } from "../utils/cache.js";
import type { FoodDiscount } from "../utils/discount.js";
import { optimizeImage } from "../utils/imageOptimizer.js";
import { getPopularFoodsByLocation } from "../services/analyticsService.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AVAILABLE_LOCATIONS = ['шатой', 'гикало'] as const;
const DEFAULT_POPULAR_LIMIT = 8;
const DEFAULT_POPULAR_DAYS = 30;
const MAX_POPULAR_LIMIT = 20;
const MAX_POPULAR_DAYS = 365;

const parsePositiveInteger = (value: unknown, fallback: number, maxValue: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, maxValue);
};

const requireAdmin = (userRole: string | undefined): void => {
  if (userRole !== 'admin') {
    throw new UnauthorizedError('Только администратор может выполнять эту операцию');
  }
};

const requireAdminOrWorker = (userRole: string | undefined): void => {
  if (userRole !== 'admin' && userRole !== 'worker') {
    throw new UnauthorizedError('Только администратор или работник могут выполнять эту операцию');
  }
};

export const getAllFoods = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userRole = res.locals.userRole;
        const userLocation = res.locals.userLocation;
        
        const foods = await Food.find();
        
        // Работники видят только блюда своего центра с актуальным статусом наличия
        if (userRole === 'worker' && userLocation) {
            const filteredFoods = foods
                .filter(food => food.locations && food.locations.includes(userLocation))
                .map(food => {
                    const foodObj: any = food.toObject();
                    
                    // Конвертируем Map в простой объект
                    if (food.stockByLocation) {
                        const stockByLocationObj: Record<string, boolean> = {};
                        food.stockByLocation.forEach((value, key) => {
                            stockByLocationObj[key] = value;
                        });
                        foodObj.stockByLocation = stockByLocationObj;
                    }
                    
                    // Подменяем глобальный inStock на статус конкретного центра
                    foodObj.inStock = food.stockByLocation?.get(userLocation) ?? true;
                    return foodObj;
                });
            
            res.status(200).json({ foods: filteredFoods });
        } else {
            // Для админа тоже конвертируем Map
            const serializedFoods = foods.map(food => {
                const foodObj: any = food.toObject();
                
                if (food.stockByLocation) {
                    const stockByLocationObj: Record<string, boolean> = {};
                    food.stockByLocation.forEach((value, key) => {
                        stockByLocationObj[key] = value;
                    });
                    foodObj.stockByLocation = stockByLocationObj;
                }
                
                return foodObj;
            });
            
            res.status(200).json({ foods: serializedFoods });
        }
    } catch (error) {
        next(error)
    }
}

export const getFoodByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category } = req.params;
        const userRole = res.locals.userRole;
        const userLocation = res.locals.userLocation;
        
        const foods = await Food.find({ category: category as string });
        
        // Работники видят только блюда своего центра с актуальным статусом наличия
        if (userRole === 'worker' && userLocation) {
            const filteredFoods = foods
                .filter(food => food.locations && food.locations.includes(userLocation))
                .map(food => {
                    const foodObj: any = food.toObject();
                    
                    // Конвертируем Map в простой объект
                    if (food.stockByLocation) {
                        const stockByLocationObj: Record<string, boolean> = {};
                        food.stockByLocation.forEach((value, key) => {
                            stockByLocationObj[key] = value;
                        });
                        foodObj.stockByLocation = stockByLocationObj;
                    }
                    
                    // Подменяем глобальный inStock на статус конкретного центра
                    foodObj.inStock = food.stockByLocation?.get(userLocation) ?? true;
                    return foodObj;
                });
            
            res.status(200).json({ foods: filteredFoods });
        } else {
            // Для админа тоже конвертируем Map
            const serializedFoods = foods.map(food => {
                const foodObj: any = food.toObject();
                
                if (food.stockByLocation) {
                    const stockByLocationObj: Record<string, boolean> = {};
                    food.stockByLocation.forEach((value, key) => {
                        stockByLocationObj[key] = value;
                    });
                    foodObj.stockByLocation = stockByLocationObj;
                }
                
                return foodObj;
            });
            
            res.status(200).json({ foods: serializedFoods });
        }
    } catch (error) {
        next(error)
    }
}

export const getPopularFoods = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { location, limit, days } = req.query;

        if (typeof location !== 'string' || !AVAILABLE_LOCATIONS.includes(location as (typeof AVAILABLE_LOCATIONS)[number])) {
            throw new BadRequestError('Локация должна быть "шатой" или "гикало"');
        }

        const parsedLimit = parsePositiveInteger(limit, DEFAULT_POPULAR_LIMIT, MAX_POPULAR_LIMIT);
        const parsedDays = parsePositiveInteger(days, DEFAULT_POPULAR_DAYS, MAX_POPULAR_DAYS);

        const popularFoods = await getPopularFoodsByLocation(location, {
            limit: parsedLimit,
            days: parsedDays
        });

        if (popularFoods.length === 0) {
            res.status(200).json({ foods: [] });
            return;
        }

        const popularFoodIds = popularFoods.map(item => item.foodId);
        const foods = await Food.find({
            _id: { $in: popularFoodIds },
            locations: location
        });

        const foodById = new Map(foods.map(food => [food._id.toString(), food]));
        const sortedFoods = popularFoodIds
            .map(foodId => foodById.get(foodId))
            .filter((food): food is NonNullable<typeof food> => Boolean(food));

        const serializedFoods = sortedFoods.map(food => {
            const foodObj: any = food.toObject();

            if (food.stockByLocation) {
                const stockByLocationObj: Record<string, boolean> = {};
                food.stockByLocation.forEach((value, key) => {
                    stockByLocationObj[key] = value;
                });
                foodObj.stockByLocation = stockByLocationObj;
            }

            return foodObj;
        });

        res.status(200).json({ foods: serializedFoods });
    } catch (error) {
        next(error);
    }
}

export const createFood = async (req: Request, res: Response, next: NextFunction) => {
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
        await optimizeImage(fullImagePath);

        // Парсим locations из JSON строки
        let parsedLocations: string[] = ['шатой', 'гикало'];
        if (locations) {
            try {
                parsedLocations = typeof locations === 'string' ? JSON.parse(locations) : locations;
            } catch {
                parsedLocations = ['шатой', 'гикало'];
            }
        }

        if (!Array.isArray(parsedLocations) || parsedLocations.length === 0) {
            throw new BadRequestError('Выберите хотя бы один центр');
        }

        const imagePath = `/uploads/images/${file.filename}`;
        const initialStock = inStock !== undefined ? (inStock === 'true' || inStock === true) : true;
        
        // Создаем stockByLocation только для выбранных локаций
        const stockByLocationMap = new Map<string, boolean>();
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

        await food.save();
        await invalidateFoodCache();
        res.status(201).json({ food });
    } catch (error) {
        next(error);
    }
}

type FoodLocation = (typeof AVAILABLE_LOCATIONS)[number];

const parseLocations = (locations: unknown): FoodLocation[] => {
    let parsed: unknown = locations;

    if (typeof locations === 'string') {
        try {
            parsed = JSON.parse(locations);
        } catch {
            throw new BadRequestError('Некорректный список центров');
        }
    }

    if (!Array.isArray(parsed)) {
        throw new BadRequestError('Некорректный список центров');
    }

    const validLocations = parsed.filter(
        (location): location is FoodLocation =>
            typeof location === 'string' && (AVAILABLE_LOCATIONS as readonly string[]).includes(location)
    );

    if (validLocations.length === 0) {
        throw new BadRequestError('Выберите хотя бы один центр');
    }

    return validLocations;
};

const MIN_DISCOUNT_PERCENT = 1;
const MAX_DISCOUNT_PERCENT = 99;

// Пустое значение = акции нет. Ожидается JSON: { percent, startDate, endDate }
const parseDiscount = (discount: unknown): FoodDiscount | null => {
    if (discount === undefined || discount === null || discount === '') {
        return null;
    }

    let parsed: unknown = discount;
    if (typeof discount === 'string') {
        try {
            parsed = JSON.parse(discount);
        } catch {
            throw new BadRequestError('Некорректные данные акции');
        }
    }

    if (typeof parsed !== 'object' || parsed === null) {
        throw new BadRequestError('Некорректные данные акции');
    }

    const { percent, startDate, endDate } = parsed as Record<string, unknown>;

    const parsedPercent = Number(percent);
    if (!Number.isInteger(parsedPercent) || parsedPercent < MIN_DISCOUNT_PERCENT || parsedPercent > MAX_DISCOUNT_PERCENT) {
        throw new BadRequestError(`Процент скидки должен быть целым числом от ${MIN_DISCOUNT_PERCENT} до ${MAX_DISCOUNT_PERCENT}`);
    }

    const parsedStart = new Date(String(startDate));
    const parsedEnd = new Date(String(endDate));
    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        throw new BadRequestError('Укажите корректный период акции');
    }

    if (parsedEnd < parsedStart) {
        throw new BadRequestError('Дата окончания акции не может быть раньше даты начала');
    }

    return { percent: parsedPercent, startDate: parsedStart, endDate: parsedEnd };
};

const serializeFood = (food: InstanceType<typeof Food>) => {
    const foodObj: any = food.toObject();

    if (food.stockByLocation) {
        const stockByLocationObj: Record<string, boolean> = {};
        food.stockByLocation.forEach((value, key) => {
            stockByLocationObj[key] = value;
        });
        foodObj.stockByLocation = stockByLocationObj;
    }

    return foodObj;
};

export const updateFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
        requireAdmin(res.locals.userRole);

        const { id } = req.params;
        const { name, price, category, locations, discount } = req.body;
        const file = req.file;

        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название обязательно');
        }

        const parsedPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (typeof parsedPrice !== 'number' || isNaN(parsedPrice) || parsedPrice <= 0) {
            throw new BadRequestError('Цена должна быть положительным числом');
        }

        if (!category || typeof category !== 'string' || !category.trim()) {
            throw new BadRequestError('Категория обязательна');
        }

        const parsedLocations = parseLocations(locations);
        const parsedDiscount = parseDiscount(discount);

        const food = await Food.findById(id);
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        // Сохраняем текущее наличие для оставшихся центров, новые центры - в наличии
        const stockByLocation = new Map<string, boolean>();
        parsedLocations.forEach(location => {
            const wasAvailable = food.locations?.includes(location);
            stockByLocation.set(location, wasAvailable ? food.stockByLocation?.get(location) ?? true : true);
        });

        food.name = name.trim();
        food.price = parsedPrice;
        food.category = category.trim();
        food.locations = parsedLocations;
        food.set('discount', parsedDiscount);
        food.stockByLocation = stockByLocation;
        food.inStock = Array.from(stockByLocation.values()).some(stock => stock === true);

        if (file) {
            const fullImagePath = path.join(__dirname, '../../uploads/images', file.filename);
            await optimizeImage(fullImagePath);
            food.image = `/uploads/images/${file.filename}`;
        }

        await food.save();
        await invalidateFoodCache();
        res.status(200).json({ food: serializeFood(food) });
    } catch (error) {
        next(error);
    }
}

export const updateFoodPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        requireAdmin(res.locals.userRole);
        
        const { id } = req.params;
        const { price } = req.body;

        if (!price || typeof price !== 'number' || price <= 0) {
            throw new BadRequestError('Цена должна быть положительным числом');
        }

        const food = await Food.findByIdAndUpdate(
            id,
            { price },
            { new: true }
        );

        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        await invalidateFoodCache();
        res.status(200).json({ food });
    } catch (error) {
        next(error);
    }
}

export const updateFoodStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        requireAdminOrWorker(res.locals.userRole);
        
        const { id } = req.params;
        const { inStock, location: targetLocation } = req.body;
        const userRole = res.locals.userRole;
        const userLocation = res.locals.userLocation;

        if (typeof inStock !== 'boolean') {
            throw new BadRequestError('inStock должен быть булевым значением');
        }

        let food = await Food.findById(id);

        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        if (!food.stockByLocation) {
            food.stockByLocation = new Map();
        }

        let updateData: any = {};

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
            } else {
                // Админ обновляет все центры сразу (кнопка "Переключить все")
                updateData = {
                    'stockByLocation.шатой': inStock,
                    'stockByLocation.гикало': inStock,
                    inStock: inStock
                };
            }
        }

        // Используем findByIdAndUpdate для обновления без полной валидации
        food = await Food.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: false }
        );

        await invalidateFoodCache();
        
        if (food) {
            // Преобразуем Map в обычный объект для JSON
            const foodObj: any = food.toObject();
            
            // Конвертируем Map в простой объект
            if (food.stockByLocation) {
                const stockByLocationObj: Record<string, boolean> = {};
                food.stockByLocation.forEach((value, key) => {
                    stockByLocationObj[key] = value;
                });
                foodObj.stockByLocation = stockByLocationObj;
            }
            
            // Для работника подменяем inStock на статус его центра
            if (userRole === 'worker' && userLocation) {
                foodObj.inStock = food.stockByLocation?.get(userLocation) ?? true;
            }
            
            res.status(200).json({ food: foodObj });
        } else {
            res.status(200).json({ food: null });
        }
    } catch (error) {
        next(error);
    }
}

export const updateFoodName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        requireAdmin(res.locals.userRole);
        
        const { id } = req.params;
        const { name } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestError('Название обязательно и должно быть непустой строкой');
        }

        const food = await Food.findByIdAndUpdate(
            id,
            { name: name.trim() },
            { new: true }
        );

        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        await invalidateFoodCache();
        res.status(200).json({ food });
    } catch (error) {
        next(error);
    }
}

export const updateFoodImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        requireAdmin(res.locals.userRole);
        
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            throw new BadRequestError('Изображение обязательно');
        }

        const food = await Food.findById(id);
        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        // Оптимизируем изображение
        const fullImagePath = path.join(__dirname, '../../uploads/images', file.filename);
        await optimizeImage(fullImagePath);

        const imagePath = `/uploads/images/${file.filename}`;
        const updatedFood = await Food.findByIdAndUpdate(
            id,
            { image: imagePath },
            { new: true }
        );

        await invalidateFoodCache();
        res.status(200).json({ food: updatedFood });
    } catch (error) {
        next(error);
    }
}

export const deleteFood = async (req: Request, res: Response, next: NextFunction) => {
    try {
        requireAdmin(res.locals.userRole);
        
        const { id } = req.params;
        const food = await Food.findByIdAndDelete(id);

        if (!food) {
            throw new NotFoundError('Еда не найдена');
        }

        await invalidateFoodCache();
        res.status(200).json({ message: 'Еда удалена успешно' });
    } catch (error) {
        next(error);
    }
}