import redisClient from '../utils/redis.js';
import { invalidateDashboardCache } from './analyticsService.js';

const CHANNEL_ORDERS = 'dashboard:orders';

export type DashboardEventType = 'order_created' | 'order_status_updated' | 'order_completed';

export interface DashboardOrderEvent {
  type: DashboardEventType;
  orderId: string;
  location?: string;
  role?: 'admin' | 'worker';
}

function publish(event: DashboardOrderEvent): void {
  try {
    if (redisClient.isOpen) {
      redisClient.publish(CHANNEL_ORDERS, JSON.stringify(event));
    }
  } catch {
    // ignore
  }
  invalidateDashboardCache();
}

export function publishOrderCreated(orderId: string, location: string): void {
  publish({ type: 'order_created', orderId, location });
}

export function publishOrderStatusUpdated(orderId: string, location: string): void {
  publish({ type: 'order_status_updated', orderId, location });
}

export function getOrdersChannel(): string {
  return CHANNEL_ORDERS;
}
