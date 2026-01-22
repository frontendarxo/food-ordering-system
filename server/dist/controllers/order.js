var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Order from "../modules/orderSchema.js";
import Food from "../modules/FoodSchema.js";
import { NotFoundError } from "../errors/not-found.js";
import { BadRequestError } from "../errors/bad-request.js";
import { UnauthorizedError } from "../errors/unauthorized.js";
import { invalidateOrderCache } from "../utils/cache.js";
const requireAdminOrWorker = (userRole) => {
    if (userRole !== 'admin' && userRole !== 'worker') {
        throw new UnauthorizedError('Только администратор или работник могут выполнять эту операцию');
    }
};
export const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, items, deliveryMethod, address, paymentMethod, location } = req.body;
        if (!phoneNumber) {
            throw new BadRequestError('Номер телефона обязателен');
        }
        const numberStr = String(phoneNumber).replace(/\D/g, '');
        if (numberStr.length !== 11 || !numberStr.startsWith('8')) {
            throw new BadRequestError('Номер должен содержать 11 цифр и начинаться с 8');
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestError('Корзина пуста');
        }
        if (!deliveryMethod || !['самовызов', 'доставка'].includes(deliveryMethod)) {
            throw new BadRequestError('Метод получения обязателен');
        }
        if (deliveryMethod === 'доставка' && (!address || address.trim().length < 5)) {
            throw new BadRequestError('Адрес обязателен для доставки и должен быть не менее 5 символов');
        }
        if (!paymentMethod || !['наличка', 'карта'].includes(paymentMethod)) {
            throw new BadRequestError('Метод оплаты обязателен');
        }
        if (!location || !['шатой', 'гикало'].includes(location)) {
            throw new BadRequestError('Локация обязательна');
        }
        const foodIds = items.map((item) => item.food);
        const foods = yield Food.find({ _id: { $in: foodIds } });
        const foodMap = new Map(foods.map(food => [food._id.toString(), food]));
        const orderItems = items.map((cartItem) => {
            const food = foodMap.get(cartItem.food);
            if (!food) {
                throw new NotFoundError(`Еда с ID ${cartItem.food} не найдена`);
            }
            return {
                food: cartItem.food,
                quantity: cartItem.quantity,
                price: food.price
            };
        });
        const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const orderData = {
            phoneNumber: numberStr,
            items: orderItems,
            total,
            deliveryMethod,
            paymentMethod,
            location
        };
        if (deliveryMethod === 'доставка') {
            orderData.address = address.trim();
        }
        const order = new Order(orderData);
        yield order.save();
        yield order.populate('items.food');
        yield invalidateOrderCache();
        res.status(201).json({
            message: 'Заказ создан успешно',
            order
        });
    }
    catch (error) {
        next(error);
    }
});
export const getAllOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdminOrWorker(res.locals.userRole);
        const userRole = res.locals.userRole;
        const userLocation = res.locals.userLocation;
        let query = {};
        // Работники видят только заказы своего центра
        if (userRole === 'worker' && userLocation) {
            query.location = userLocation;
        }
        // Админ видит все заказы (query остается пустым)
        const orders = yield Order.find(query).populate('items.food').sort({ created_at: -1 });
        res.status(200).json({ orders });
    }
    catch (error) {
        next(error);
    }
});
export const updateOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdminOrWorker(res.locals.userRole);
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
            throw new BadRequestError('Некорректный статус заказа');
        }
        const order = yield Order.findByIdAndUpdate(id, {
            status,
            statusChangedAt: new Date()
        }, { new: true }).populate('items.food');
        if (!order) {
            throw new NotFoundError('Заказ не найден');
        }
        yield invalidateOrderCache();
        res.status(200).json({ order });
    }
    catch (error) {
        next(error);
    }
});
export const deleteOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        requireAdminOrWorker(res.locals.userRole);
        const { id } = req.params;
        const order = yield Order.findByIdAndDelete(id);
        if (!order) {
            throw new NotFoundError('Заказ не найден');
        }
        yield invalidateOrderCache();
        res.status(200).json({ message: 'Заказ удален', orderId: id });
    }
    catch (error) {
        next(error);
    }
});
