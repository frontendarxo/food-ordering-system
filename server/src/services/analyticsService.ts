import Order from '../modules/orderSchema.js';
import redisClient from '../utils/redis.js';

const DASHBOARD_CACHE_TTL = 45;
const CACHE_KEY_ADMIN = 'dashboard:admin';
const CACHE_KEY_ADMIN_DATE_PREFIX = 'dashboard:admin:date:';
const CACHE_KEY_WORKER_PREFIX = 'dashboard:worker:';

const TZ_OFFSET: Record<string, string> = {
  'Europe/Moscow': '+03:00',
  'Asia/Dubai': '+04:00',
  UTC: '+00:00',
};

function getDateRangeUTC(startDate: string, endDate: string, tz: string): { start: Date; end: Date } {
  const offset = TZ_OFFSET[tz] ?? '+03:00';
  return {
    start: new Date(startDate + 'T00:00:00.000' + offset),
    end: new Date(endDate + 'T23:59:59.999' + offset),
  };
}

export interface OrdersByPeriod {
  today: number;
  week: number;
  month: number;
}

export interface RevenueByLocation {
  location: string;
  revenue: number;
  orderCount: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface OrdersPerHourItem {
  hour: number;
  count: number;
  date: string;
}

export interface TopDish {
  foodId: string;
  name?: string;
  totalQuantity: number;
  orderCount: number;
}

export interface AdminDashboardData {
  ordersByPeriod: OrdersByPeriod;
  revenueByLocation: RevenueByLocation[];
  ordersByStatus: OrdersByStatus[];
  liveIncomingCount: number;
  ordersPerHour: OrdersPerHourItem[];
  topDishes: TopDish[];
  avgProcessingTimeMinutes: number;
  locationComparison: RevenueByLocation[];
}

export interface WorkerDashboardData {
  ordersByStatus: OrdersByStatus[];
  liveIncomingCount: number;
  avgProcessingTimeMinutes: number;
  activeWorkload: number;
}

function getDateRanges() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startOfToday, startOfWeek, startOfMonth };
}

type DateRange = { start: Date; end: Date } | null;

async function getOrdersByPeriod(
  query: Record<string, unknown> = {},
  dateRange: DateRange = null
): Promise<OrdersByPeriod> {
  const baseMatch = Object.keys(query).length ? query : {};
  const dateMatch = dateRange
    ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } }
    : {};

  if (dateRange) {
    const total = await Order.countDocuments({ ...baseMatch, ...dateMatch });
    return { today: total, week: total, month: total };
  }
  const { startOfToday, startOfWeek, startOfMonth } = getDateRanges();
  const [today, week, month] = await Promise.all([
    Order.countDocuments({ ...baseMatch, created_at: { $gte: startOfToday } }),
    Order.countDocuments({ ...baseMatch, created_at: { $gte: startOfWeek } }),
    Order.countDocuments({ ...baseMatch, created_at: { $gte: startOfMonth } }),
  ]);
  return { today, week, month };
}

async function getRevenueByLocation(
  query: Record<string, unknown> = {},
  dateRange: DateRange = null
): Promise<RevenueByLocation[]> {
  const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
  const result = await Order.aggregate([
    { $match: { ...query, status: 'confirmed', ...dateMatch } },
    { $group: { _id: '$location', revenue: { $sum: '$total' }, orderCount: { $sum: 1 } } },
    { $project: { location: '$_id', revenue: 1, orderCount: 1, _id: 0 } },
  ]);
  return result;
}

async function getOrdersByStatus(
  query: Record<string, unknown> = {},
  dateRange: DateRange = null
): Promise<OrdersByStatus[]> {
  const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
  const result = await Order.aggregate([
    { $match: { ...query, ...dateMatch } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } },
  ]);
  const statusOrder = ['pending', 'confirmed', 'cancelled'];
  return statusOrder.map((status) => ({
    status,
    count: result.find((r) => r.status === status)?.count ?? 0,
  }));
}

async function getLiveIncomingCount(query: Record<string, unknown> = {}): Promise<number> {
  const { startOfToday } = getDateRanges();
  return Order.countDocuments({ ...query, status: 'pending', created_at: { $gte: startOfToday } });
}

const DASHBOARD_TIMEZONE = process.env.DASHBOARD_TIMEZONE || 'Europe/Moscow';

async function getOrdersPerHour(
  query: Record<string, unknown> = {},
  limit = 24,
  dateRange: DateRange = null
): Promise<OrdersPerHourItem[]> {
  const rangeMatch = dateRange
    ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } }
    : { created_at: { $gte: getDateRanges().startOfToday } };
  const result = await Order.aggregate([
    { $match: { ...query, ...rangeMatch } },
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
}

async function getTopDishes(
  query: Record<string, unknown> = {},
  limit = 5,
  dateRange: DateRange = null
): Promise<TopDish[]> {
  const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
  const result = await Order.aggregate([
    { $match: { ...query, ...dateMatch } },
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
}

async function getAvgProcessingTimeMinutes(
  query: Record<string, unknown> = {},
  dateRange: DateRange = null
): Promise<number> {
  const dateMatch = dateRange ? { created_at: { $gte: dateRange.start, $lte: dateRange.end } } : {};
  const result = await Order.aggregate([
    {
      $match: {
        ...query,
        status: 'confirmed',
        statusChangedAt: { $exists: true, $ne: null },
        ...dateMatch,
      },
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
  const avgMs = result[0]?.avgMs;
  if (avgMs == null || avgMs < 0) return 0;
  return Math.round(avgMs / (60 * 1000));
}

async function getCached<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  try {
    if (redisClient.isOpen) {
      const raw = await redisClient.get(key);
      if (raw) return JSON.parse(raw) as T;
    }
  } catch {
    // ignore
  }
  const data = await fetchFn();
  try {
    if (redisClient.isOpen) {
      await redisClient.setEx(key, DASHBOARD_CACHE_TTL, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
  return data;
}

export interface AdminDashboardParams {
  startDate?: string;
  endDate?: string;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateRange(params: AdminDashboardParams): DateRange | null {
  const { startDate, endDate } = params;
  if (!startDate || !endDate || !DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
    return null;
  }
  if (startDate > endDate) return null;
  const tz = process.env.DASHBOARD_TIMEZONE || 'Europe/Moscow';
  return getDateRangeUTC(startDate, endDate, tz);
}

export async function getAdminDashboard(params: AdminDashboardParams = {}): Promise<AdminDashboardData> {
  const dateRange = parseDateRange(params);
  const cacheKey = dateRange
    ? `${CACHE_KEY_ADMIN_DATE_PREFIX}${params.startDate!}_${params.endDate!}`
    : CACHE_KEY_ADMIN;

  return getCached(cacheKey, async () => {
    const [
      ordersByPeriod,
      revenueByLocation,
      ordersByStatus,
      liveIncomingCount,
      ordersPerHour,
      topDishes,
      avgProcessingTimeMinutes,
    ] = await Promise.all([
      getOrdersByPeriod({}, dateRange),
      getRevenueByLocation({}, dateRange),
      getOrdersByStatus({}, dateRange),
      dateRange ? Promise.resolve(0) : getLiveIncomingCount(),
      getOrdersPerHour({}, 24, dateRange),
      getTopDishes({}, 5, dateRange),
      getAvgProcessingTimeMinutes({}, dateRange),
    ]);
    return {
      ordersByPeriod,
      revenueByLocation,
      ordersByStatus,
      liveIncomingCount,
      ordersPerHour,
      topDishes,
      avgProcessingTimeMinutes,
      locationComparison: revenueByLocation,
    };
  });
}

export async function getWorkerDashboard(location: string): Promise<WorkerDashboardData> {
  const query = { location };
  const key = `${CACHE_KEY_WORKER_PREFIX}${location}`;
  return getCached(key, async () => {
    const [ordersByStatus, liveIncomingCount, avgProcessingTimeMinutes, activeWorkload] = await Promise.all([
      getOrdersByStatus(query),
      getLiveIncomingCount(query),
      getAvgProcessingTimeMinutes(query),
      Order.countDocuments({ ...query, status: { $in: ['pending', 'confirmed'] } }),
    ]);
    return {
      ordersByStatus,
      liveIncomingCount,
      avgProcessingTimeMinutes,
      activeWorkload,
    };
  });
}

export function invalidateDashboardCache(): void {
  const run = async () => {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.del(CACHE_KEY_ADMIN);
      const dateKeys = await redisClient.keys(`${CACHE_KEY_ADMIN_DATE_PREFIX}*`);
      if (dateKeys.length > 0) await redisClient.del(dateKeys);
      const keys = await redisClient.keys(`${CACHE_KEY_WORKER_PREFIX}*`);
      if (keys.length > 0) await redisClient.del(keys);
    } catch {
      // ignore
    }
  };
  run();
}
