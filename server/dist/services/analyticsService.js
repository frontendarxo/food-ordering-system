var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Order from '../modules/orderSchema.js';
import redisClient from '../utils/redis.js';
const DASHBOARD_CACHE_TTL = 45;
const CACHE_KEY_ADMIN = 'dashboard:admin';
const CACHE_KEY_ADMIN_DATE_PREFIX = 'dashboard:admin:date:';
const CACHE_KEY_WORKER_PREFIX = 'dashboard:worker:';
const TOP_DISHES_LIMIT = 6;
const TZ_OFFSET = {
    'Europe/Moscow': '+03:00',
    'Asia/Dubai': '+04:00',
    UTC: '+00:00',
};
function getDateRangeUTC(startDate, endDate, tz) {
    var _a;
    const offset = (_a = TZ_OFFSET[tz]) !== null && _a !== void 0 ? _a : '+03:00';
    return {
        start: new Date(startDate + 'T00:00:00.000' + offset),
        end: new Date(endDate + 'T23:59:59.999' + offset),
    };
}
function getDateRanges() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startOfToday, startOfWeek, startOfMonth };
}
function getOrdersByPeriod() {
    return __awaiter(this, arguments, void 0, function* (query = {}, dateRange = null) {
        const baseMatch = Object.keys(query).length ? query : {};
        const dateMatch = dateRange
            ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } }
            : {};
        if (dateRange) {
            const total = yield Order.countDocuments(Object.assign(Object.assign({}, baseMatch), dateMatch));
            return { today: total, week: total, month: total };
        }
        const { startOfToday, startOfWeek, startOfMonth } = getDateRanges();
        const [today, week, month] = yield Promise.all([
            Order.countDocuments(Object.assign(Object.assign({}, baseMatch), { created_at: { $gte: startOfToday } })),
            Order.countDocuments(Object.assign(Object.assign({}, baseMatch), { created_at: { $gte: startOfWeek } })),
            Order.countDocuments(Object.assign(Object.assign({}, baseMatch), { created_at: { $gte: startOfMonth } })),
        ]);
        return { today, week, month };
    });
}
function getRevenueByLocation() {
    return __awaiter(this, arguments, void 0, function* (query = {}, dateRange = null) {
        const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
        const result = yield Order.aggregate([
            { $match: Object.assign(Object.assign(Object.assign({}, query), { status: 'confirmed' }), dateMatch) },
            { $group: { _id: '$location', revenue: { $sum: '$total' }, orderCount: { $sum: 1 } } },
            { $project: { location: '$_id', revenue: 1, orderCount: 1, _id: 0 } },
        ]);
        return result;
    });
}
function getOrdersByStatus() {
    return __awaiter(this, arguments, void 0, function* (query = {}, dateRange = null) {
        const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
        const result = yield Order.aggregate([
            { $match: Object.assign(Object.assign({}, query), dateMatch) },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
        ]);
        const statusOrder = ['pending', 'confirmed', 'cancelled'];
        return statusOrder.map((status) => {
            var _a, _b;
            return ({
                status,
                count: (_b = (_a = result.find((r) => r.status === status)) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : 0,
            });
        });
    });
}
const STATUS_ORDER = ['pending', 'confirmed', 'cancelled'];
function getOrdersByStatusByLocation() {
    return __awaiter(this, arguments, void 0, function* (query = {}, dateRange = null) {
        var _a, _b, _c;
        const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
        const result = yield Order.aggregate([
            { $match: Object.assign(Object.assign({}, query), dateMatch) },
            { $group: { _id: { location: '$location', status: '$status' }, count: { $sum: 1 } } },
            { $project: { location: '$_id.location', status: '$_id.status', count: 1, _id: 0 } },
        ]);
        const byLocation = new Map();
        for (const row of result) {
            const loc = String((_a = row.location) !== null && _a !== void 0 ? _a : '').trim();
            const status = String((_b = row.status) !== null && _b !== void 0 ? _b : '').toLowerCase();
            const count = Number(row.count) || 0;
            if (!byLocation.has(loc))
                byLocation.set(loc, { pending: 0, confirmed: 0, cancelled: 0 });
            const map = byLocation.get(loc);
            if (status === 'pending')
                map.pending = count;
            else if (status === 'confirmed')
                map.confirmed = count;
            else if (status === 'cancelled')
                map.cancelled = count;
        }
        const flat = [];
        for (const [location] of byLocation) {
            const map = byLocation.get(location);
            for (const status of STATUS_ORDER) {
                flat.push({ location, status, count: (_c = map[status]) !== null && _c !== void 0 ? _c : 0 });
            }
        }
        return flat;
    });
}
function getLiveIncomingCount() {
    return __awaiter(this, arguments, void 0, function* (query = {}, dateRange = null) {
        const dateMatch = dateRange
            ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } }
            : { created_at: { $gte: getDateRanges().startOfToday } };
        return Order.countDocuments(Object.assign(Object.assign(Object.assign({}, query), { status: 'pending' }), dateMatch));
    });
}
const DASHBOARD_TIMEZONE = process.env.DASHBOARD_TIMEZONE || 'Europe/Moscow';
function getOrdersPerHour() {
    return __awaiter(this, arguments, void 0, function* (query = {}, limit = 24, dateRange = null) {
        const rangeMatch = dateRange
            ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } }
            : { created_at: { $gte: getDateRanges().startOfToday } };
        const result = yield Order.aggregate([
            { $match: Object.assign(Object.assign({}, query), rangeMatch) },
            {
                $addFields: {
                    localHour: { $toInt: { $dateToString: { format: '%H', date: '$created_at', timezone: DASHBOARD_TIMEZONE } } },
                    localDate: { $dateToString: { format: '%Y-%m-%d', date: '$created_at', timezone: DASHBOARD_TIMEZONE } },
                },
            },
            {
                $group: {
                    _id: { hour: '$localHour', date: '$localDate' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.hour': 1 } },
            { $limit: limit },
            {
                $project: {
                    hour: '$_id.hour',
                    date: '$_id.date',
                    count: 1,
                    _id: 0,
                },
            },
        ]);
        return result;
    });
}
function getTopDishes() {
    return __awaiter(this, arguments, void 0, function* (query = {}, limit = 5, dateRange = null) {
        const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
        const result = yield Order.aggregate([
            { $match: Object.assign(Object.assign({}, query), dateMatch) },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.food',
                    totalQuantity: { $sum: '$items.quantity' },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'foods',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'foodDoc',
                },
            },
            { $unwind: { path: '$foodDoc', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    foodId: { $toString: '$_id' },
                    name: '$foodDoc.name',
                    totalQuantity: 1,
                    orderCount: 1,
                    _id: 0,
                },
            },
        ]);
        return result;
    });
}
const DEFAULT_POPULAR_LIMIT = 8;
const MAX_POPULAR_LIMIT = 20;
const DEFAULT_POPULAR_DAYS = 30;
const MAX_POPULAR_DAYS = 365;
export function getPopularFoodsByLocation(location_1) {
    return __awaiter(this, arguments, void 0, function* (location, params = {}) {
        var _a, _b;
        const safeLimit = Math.max(1, Math.min((_a = params.limit) !== null && _a !== void 0 ? _a : DEFAULT_POPULAR_LIMIT, MAX_POPULAR_LIMIT));
        const safeDays = Math.max(1, Math.min((_b = params.days) !== null && _b !== void 0 ? _b : DEFAULT_POPULAR_DAYS, MAX_POPULAR_DAYS));
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - safeDays);
        const result = yield Order.aggregate([
            {
                $match: {
                    location,
                    status: 'confirmed',
                    created_at: { $gte: sinceDate },
                },
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.food',
                    totalQuantity: { $sum: '$items.quantity' },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: safeLimit },
            {
                $project: {
                    foodId: { $toString: '$_id' },
                    totalQuantity: 1,
                    orderCount: 1,
                    _id: 0,
                },
            },
        ]);
        return result;
    });
}
function getAvgProcessingTimeMinutes() {
    return __awaiter(this, arguments, void 0, function* (query = {}, dateRange = null) {
        var _a;
        const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
        const result = yield Order.aggregate([
            {
                $match: Object.assign(Object.assign(Object.assign({}, query), { status: 'confirmed', statusChangedAt: { $exists: true, $ne: null } }), dateMatch),
            },
            {
                $project: {
                    diffMs: { $subtract: ['$statusChangedAt', '$created_at'] },
                },
            },
            {
                $group: {
                    _id: null,
                    avgMs: { $avg: '$diffMs' },
                },
            },
        ]);
        const avgMs = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.avgMs;
        if (avgMs == null || avgMs < 0)
            return 0;
        return Math.round(avgMs / (60 * 1000));
    });
}
function getAvgAcceptanceTimeByLocation() {
    return __awaiter(this, arguments, void 0, function* (dateRange = null) {
        const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
        const result = yield Order.aggregate([
            {
                $match: Object.assign({ status: 'confirmed', statusChangedAt: { $exists: true, $ne: null } }, dateMatch),
            },
            {
                $project: {
                    location: 1,
                    diffMs: { $subtract: ['$statusChangedAt', '$created_at'] },
                },
            },
            {
                $group: {
                    _id: '$location',
                    avgMs: { $avg: '$diffMs' },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { avgMs: 1 } },
            {
                $project: {
                    location: '$_id',
                    avgMinutes: { $round: [{ $divide: ['$avgMs', 60 * 1000] }, 0] },
                    orderCount: 1,
                    _id: 0,
                },
            },
        ]);
        return result.map((r) => {
            var _a;
            return ({
                location: String((_a = r.location) !== null && _a !== void 0 ? _a : ''),
                avgMinutes: Number(r.avgMinutes) || 0,
                orderCount: Number(r.orderCount) || 0,
            });
        });
    });
}
function getCached(key, fetchFn) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (redisClient.isOpen) {
                const raw = yield redisClient.get(key);
                if (raw)
                    return JSON.parse(raw);
            }
        }
        catch (_a) {
            // ignore
        }
        const data = yield fetchFn();
        try {
            if (redisClient.isOpen) {
                yield redisClient.setEx(key, DASHBOARD_CACHE_TTL, JSON.stringify(data));
            }
        }
        catch (_b) {
            // ignore
        }
        return data;
    });
}
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export function parseDateRange(params) {
    const { startDate, endDate } = params;
    if (!startDate || !endDate || !DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
        return null;
    }
    if (startDate > endDate)
        return null;
    const tz = process.env.DASHBOARD_TIMEZONE || 'Europe/Moscow';
    return getDateRangeUTC(startDate, endDate, tz);
}
function getTodayRange() {
    const tz = process.env.DASHBOARD_TIMEZONE || 'Europe/Moscow';
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
    return getDateRangeUTC(todayStr, todayStr, tz);
}
export function getAdminDashboard() {
    return __awaiter(this, arguments, void 0, function* (params = {}) {
        const dateRange = parseDateRange(params);
        const rangeForMetrics = dateRange !== null && dateRange !== void 0 ? dateRange : getTodayRange();
        const cacheKey = dateRange
            ? `${CACHE_KEY_ADMIN_DATE_PREFIX}${params.startDate}_${params.endDate}`
            : CACHE_KEY_ADMIN;
        return getCached(cacheKey, () => __awaiter(this, void 0, void 0, function* () {
            const [ordersByPeriod, revenueByLocation, ordersByStatus, ordersByStatusByLocation, liveIncomingCount, ordersPerHour, topDishes, avgProcessingTimeMinutes, avgAcceptanceTimeByLocation,] = yield Promise.all([
                getOrdersByPeriod({}, dateRange),
                getRevenueByLocation({}, rangeForMetrics),
                getOrdersByStatus({}, rangeForMetrics),
                getOrdersByStatusByLocation({}, rangeForMetrics),
                getLiveIncomingCount({}, rangeForMetrics),
                getOrdersPerHour({}, 24, rangeForMetrics),
                getTopDishes({}, TOP_DISHES_LIMIT, rangeForMetrics),
                getAvgProcessingTimeMinutes({}, rangeForMetrics),
                getAvgAcceptanceTimeByLocation(rangeForMetrics),
            ]);
            return {
                ordersByPeriod,
                revenueByLocation,
                ordersByStatus,
                ordersByStatusByLocation,
                liveIncomingCount,
                ordersPerHour,
                topDishes,
                avgProcessingTimeMinutes,
                avgAcceptanceTimeByLocation,
            };
        }));
    });
}
export function getWorkerDashboard(location) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { location };
        const key = `${CACHE_KEY_WORKER_PREFIX}${location}`;
        return getCached(key, () => __awaiter(this, void 0, void 0, function* () {
            const [ordersByStatus, liveIncomingCount, avgProcessingTimeMinutes, activeWorkload] = yield Promise.all([
                getOrdersByStatus(query),
                getLiveIncomingCount(query),
                getAvgProcessingTimeMinutes(query),
                Order.countDocuments(Object.assign(Object.assign({}, query), { status: { $in: ['pending', 'confirmed'] } })),
            ]);
            return {
                ordersByStatus,
                liveIncomingCount,
                avgProcessingTimeMinutes,
                activeWorkload,
            };
        }));
    });
}
export function invalidateDashboardCache() {
    const run = () => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!redisClient.isOpen)
                return;
            yield redisClient.del(CACHE_KEY_ADMIN);
            const dateKeys = yield redisClient.keys(`${CACHE_KEY_ADMIN_DATE_PREFIX}*`);
            if (dateKeys.length > 0)
                yield redisClient.del(dateKeys);
            const keys = yield redisClient.keys(`${CACHE_KEY_WORKER_PREFIX}*`);
            if (keys.length > 0)
                yield redisClient.del(keys);
        }
        catch (_a) {
            // ignore
        }
    });
    run();
}
