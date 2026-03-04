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

export type DashboardUpdateMessage = {
  type: 'dashboard_update';
  event: 'order_created' | 'order_status_updated';
};
