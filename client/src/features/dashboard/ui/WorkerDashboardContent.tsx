import { memo, lazy, Suspense } from 'react';
import { LiveIndicator } from './LiveIndicator';
import { KPICard } from './KPICard';
import type { WorkerDashboardData } from '../api/types';
import './WorkerDashboardContent.css';

const StatusDistributionChart = lazy(() =>
  import('./StatusDistributionChart').then((m) => ({ default: m.StatusDistributionChart }))
);

const ChartSkeleton = () => (
  <div className="dashboard-chart-wrap dashboard-chart-skeleton">
    <div className="dashboard-skeleton-line dashboard-skeleton-title" style={{ width: '40%' }} />
    <div className="dashboard-chart-skeleton-inner" />
  </div>
);

interface WorkerDashboardContentProps {
  data: WorkerDashboardData;
  locationLabel: string;
  wsConnected: boolean;
}

export const WorkerDashboardContent = memo(function WorkerDashboardContent({
  data,
  locationLabel,
  wsConnected,
}: WorkerDashboardContentProps) {
  return (
    <div className="dashboard-worker">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Панель: {locationLabel}</h1>
        <LiveIndicator connected={wsConnected} />
      </header>

      <section className="dashboard-kpi-grid">
        <KPICard title="Новых заказов (ожидают)" value={data.liveIncomingCount} subtitle="сегодня" />
        <KPICard title="Текущая нагрузка" value={data.activeWorkload} subtitle="ожидают + в работе" />
        <KPICard
          title="Среднее время обработки"
          value={data.avgProcessingTimeMinutes ? `${data.avgProcessingTimeMinutes} мин` : '—'}
        />
      </section>

      <section className="dashboard-charts-grid">
        <Suspense fallback={<ChartSkeleton />}>
          <StatusDistributionChart data={data.ordersByStatus} />
        </Suspense>
      </section>
    </div>
  );
});
