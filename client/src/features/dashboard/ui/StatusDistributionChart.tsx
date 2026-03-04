import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { OrdersByStatus } from '../api/types';
import './Chart.css';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Принят',
  cancelled: 'Отменён',
};

interface StatusDistributionChartProps {
  data: OrdersByStatus[];
}

export const StatusDistributionChart = memo(function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  const chartData = data.map((d) => ({
    status: STATUS_LABELS[d.status] ?? d.status,
    count: d.count,
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (chartData.every((d) => d.count === 0)) {
    return (
      <div className="dashboard-chart-wrap">
        <h3 className="dashboard-chart-title">Заказы по статусам</h3>
        <div className="dashboard-chart-total">Всего: <strong>0</strong></div>
        <div className="dashboard-chart-empty">Нет данных</div>
      </div>
    );
  }

  return (
    <div className="dashboard-chart-wrap">
      <h3 className="dashboard-chart-title">Заказы по статусам</h3>
      <div className="dashboard-chart-total">Всего: <strong>{total}</strong></div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8 }} />
          <Bar dataKey="count" fill="#6a1b9a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
