import { memo, lazy, Suspense } from 'react';
import { LiveIndicator } from './LiveIndicator';
import { KPICard } from './KPICard';
import type { AdminDashboardData } from '../api/types';
import type { DashboardDateRange } from '../api/dashboardApi';
import './AdminDashboardContent.css';

const RevenueChart = lazy(() =>
  import('./RevenueChart').then((m) => ({ default: m.RevenueChart }))
);
const OrdersPerHourChart = lazy(() =>
  import('./OrdersPerHourChart').then((m) => ({ default: m.OrdersPerHourChart }))
);
const StatusDistributionChart = lazy(() =>
  import('./StatusDistributionChart').then((m) => ({ default: m.StatusDistributionChart }))
);
const TopDishesTable = lazy(() =>
  import('./TopDishesTable').then((m) => ({ default: m.TopDishesTable }))
);

const LOCATION_LABELS: Record<string, string> = {
  шатой: 'Шатой',
  гикало: 'Гикало',
};

function formatRevenue(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'decimal' }).format(value) + ' ₽';
}

const ChartSkeleton = () => (
  <div className="dashboard-chart-wrap dashboard-chart-skeleton">
    <div className="dashboard-skeleton-line dashboard-skeleton-title" style={{ width: '40%' }} />
    <div className="dashboard-chart-skeleton-inner" />
  </div>
);

interface AdminDashboardContentProps {
  data: AdminDashboardData;
  dateRange: DashboardDateRange | null;
}

export const AdminDashboardContent = memo(function AdminDashboardContent({
  data,
  dateRange,
}: AdminDashboardContentProps) {
  const totalRevenue = data.revenueByLocation.reduce((sum, r) => sum + r.revenue, 0);
  const isPeriodFilter = dateRange !== null;

  return (
    <div className="dashboard-admin">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Аналитика</h1>
        <LiveIndicator />
      </header>

      <section className="dashboard-kpi-grid">
        {isPeriodFilter ? (
          <KPICard title="Заказов за период" value={data.ordersByPeriod.today} />
        ) : (
          <>
            <KPICard title="Заказов сегодня" value={data.ordersByPeriod.today} />
            <KPICard title="За неделю" value={data.ordersByPeriod.week} />
            <KPICard title="За месяц" value={data.ordersByPeriod.month} />
          </>
        )}
        {!isPeriodFilter && (
          <KPICard title="Новых (ожидают)" value={data.liveIncomingCount} subtitle="сегодня" />
        )}
        <KPICard title="Выручка (принятые)" value={formatRevenue(totalRevenue)} />
        <KPICard
          title="Среднее время обработки"
          value={data.avgProcessingTimeMinutes ? `${data.avgProcessingTimeMinutes} мин` : '—'}
        />
      </section>
      {isPeriodFilter && (
        <p className="dashboard-period-hint">
          Период: {dateRange.startDate} — {dateRange.endDate}
        </p>
      )}

      <section className="dashboard-charts-grid">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart data={data.revenueByLocation} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OrdersPerHourChart data={data.ordersPerHour} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <StatusDistributionChart data={data.ordersByStatus} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <TopDishesTable items={data.topDishes} />
        </Suspense>
      </section>

      {data.locationComparison.length > 0 && (
        <section className="dashboard-location-kpi">
          <h2 className="dashboard-section-title">По локациям</h2>
          <div className="dashboard-kpi-grid">
            {data.locationComparison.map((loc) => (
              <KPICard
                key={loc.location}
                title={LOCATION_LABELS[loc.location] ?? loc.location}
                value={formatRevenue(loc.revenue)}
                subtitle={`${loc.orderCount} заказов`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
});
