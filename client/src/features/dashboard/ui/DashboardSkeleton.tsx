import { memo } from 'react';
import { SkeletonCard } from './SkeletonCard';
import './DashboardSkeleton.css';

const KPI_COUNT = 6;

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="dashboard-skeleton-header">
        <div className="dashboard-skeleton-line dashboard-skeleton-title" style={{ width: 200, height: 32 }} />
        <div className="dashboard-skeleton-line" style={{ width: 60, height: 20 }} />
      </div>
      <div className="dashboard-skeleton-kpi">
        {Array.from({ length: KPI_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="dashboard-skeleton-charts">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dashboard-skeleton-chart-block">
            <div className="dashboard-skeleton-line" style={{ width: '50%', height: 20 }} />
            <div className="dashboard-skeleton-chart-inner" />
          </div>
        ))}
      </div>
    </div>
  );
});
