import redisClient from '../utils/redis.js';
import { invalidateDashboardCache } from './analyticsService.js';
const CHANNEL_ORDERS = 'dashboard:orders';
function publish(event) {
    try {
        if (redisClient.isOpen) {
            redisClient.publish(CHANNEL_ORDERS, JSON.stringify(event));
        }
    }
    catch (_a) {
        // ignore
    }
    invalidateDashboardCache();
}
export function publishOrderCreated(orderId, location) {
    publish({ type: 'order_created', orderId, location });
}
export function publishOrderStatusUpdated(orderId, location) {
    publish({ type: 'order_status_updated', orderId, location });
}
export function getOrdersChannel() {
    return CHANNEL_ORDERS;
}
