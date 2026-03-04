import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueByLocation } from '../api/types';
import './Chart.css';

const LOCATION_LABELS: Record<string, string> = {
  шатой: 'Шатой',
  гикало: 'Гикало',
};

interface RevenueChartProps {
  data: RevenueByLocation[];
}

export const RevenueChart = memo(function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    name: LOCATION_LABELS[d.location] ?? d.location,
    revenue: d.revenue,
    заказов: d.orderCount,
  }));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  if (chartData.length === 0) {
    return (
      <div className="dashboard-chart-wrap">
        <h3 className="dashboard-chart-title">Выручка по локациям</h3>
        <div className="dashboard-chart-empty">Нет данных</div>
      </div>
    );
  }

  const yDomainMax = totalRevenue > 0 ? totalRevenue : undefined;

  return (
    <div className="dashboard-chart-wrap">
      <h3 className="dashboard-chart-title">Выручка по локациям</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v} ₽`}
            domain={yDomainMax != null ? [0, yDomainMax] : undefined}
          />
          <Tooltip contentStyle={{ borderRadius: 8 }} />
          <Bar dataKey="revenue" fill="#8A1538" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
