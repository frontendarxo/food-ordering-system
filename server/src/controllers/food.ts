import type { NextFunction, Request, Response } from "express"
import Food from "../modules/FoodSchema.js"
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";
import { UnauthorizedError } from "../errors/unauthorized.js";
import { invalidateFoodCache } from "../utils/cache.js";
import { optimizeImage } from "../utils/imageOptimizer.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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