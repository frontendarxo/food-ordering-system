import { memo } from 'react';
import './KPICard.css';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export const KPICard = memo(function KPICard({ title, value, subtitle }: KPICardProps) {
  return (
    <div className="dashboard-kpi-card">
      <div className="dashboard-kpi-title">{title}</div>
      <div className="dashboard-kpi-value">{value}</div>
      {subtitle != null && <div className="dashboard-kpi-subtitle">{subtitle}</div>}
    </div>
  );
});
