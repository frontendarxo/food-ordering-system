import { memo, useMemo, lazy, Suspense } from 'react';
import { LiveIndicator } from './LiveIndicator';
import { KPICard } from './KPICard';
import type { AdminDashboardData, AvgAcceptanceTimeByLocation } from '../api/types';
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
const StatusByLocationTable = lazy(() =>
  import('./StatusByLocationTable').then((m) => ({ default: m.StatusByLocationTable }))
);

function formatRevenue(value: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'decimal' }).format(value) + ' ₽';
}

function getFasterLocationSummary(items: AvgAcceptanceTimeByLocation[]): string | null {
  if (items.length < 2) return null;
  const [a, b] = items;
  const diff = Math.abs(a.avgMinutes - b.avgMinutes);
  if (diff === 0) return 'Локации работают одинаково';
  const faster = a.avgMinutes <= b.avgMinutes ? a.location : b.location;
  const slower = a.avgMinutes <= b.avgMinutes ? b.location : a.location;
  return `${faster} быстрее ${slower} на ${diff} мин`;
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
  wsConnected: boolean;
}

const LOCATION_LABELS: Record<string, string> = { шатой: 'Шатой', гикало: 'Гикало' };

export const AdminDashboardContent = memo(function AdminDashboardContent({
  data,
  dateRange,
  wsConnected,
}: AdminDashboardContentProps) {
  const totalRevenue = data.revenueByLocation.reduce((sum, r) => sum + r.revenue, 0);
  const isPeriodFilter = dateRange !== null;
  const acceptanceSummary = useMemo(
    () => getFasterLocationSummary(data.avgAcceptanceTimeByLocation),
    [data.avgAcceptanceTimeByLocation]
  );

  return (
    <div className="dashboard-admin">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Аналитика</h1>
        <LiveIndicator connected={wsConnected} />
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
        <KPICard
          title="В ожидании"
          value={data.liveIncomingCount}
          subtitle={isPeriodFilter ? undefined : 'сегодня'}
        />
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
        <div className="dashboard-acceptance-by-location">
          <h3 className="dashboard-section-title">Время принятия заказа по локациям</h3>
          {data.avgAcceptanceTimeByLocation.length === 0 ? (
            <p className="dashboard-acceptance-empty">Нет данных за период</p>
          ) : (
            <>
              <ul className="dashboard-acceptance-list">
                {data.avgAcceptanceTimeByLocation.map((item) => (
                  <li key={item.location}>
                    <span className="dashboard-acceptance-location">
                      {LOCATION_LABELS[item.location] ?? item.location}
                    </span>
                    <span className="dashboard-acceptance-value">
                      {item.avgMinutes} мин
                      {item.orderCount > 0 && (
                        <span className="dashboard-acceptance-count"> ({item.orderCount})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {acceptanceSummary && (
                <p className="dashboard-acceptance-summary">{acceptanceSummary}</p>
              )}
            </>
          )}
        </div>
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart data={data.revenueByLocation} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OrdersPerHourChart data={data.ordersPerHour} isPeriodFilter={isPeriodFilter} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <StatusDistributionChart data={data.ordersByStatus} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <StatusByLocationTable data={data.ordersByStatusByLocation} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <TopDishesTable items={data.topDishes} />
        </Suspense>
      </section>
    </div>
  );
});
