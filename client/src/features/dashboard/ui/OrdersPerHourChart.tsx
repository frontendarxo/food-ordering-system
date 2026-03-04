import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { OrdersPerHourItem } from '../api/types';
import './Chart.css';

interface OrdersPerHourChartProps {
  data: OrdersPerHourItem[];
}

export const OrdersPerHourChart = memo(function OrdersPerHourChart({ data }: OrdersPerHourChartProps) {
  const chartData = data.map((d) => ({
    hour: `${d.hour}:00`,
    count: d.count,
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (chartData.length === 0) {
    return (
      <div className="dashboard-chart-wrap">
        <h3 className="dashboard-chart-title">Заказы по часам (сегодня)</h3>
        <div className="dashboard-chart-total">Всего: <strong>0</strong></div>
        <div className="dashboard-chart-empty">Нет данных</div>
      </div>
    );
  }

  return (
    <div className="dashboard-chart-wrap">
      <h3 className="dashboard-chart-title">Заказы по часам (сегодня)</h3>
      <div className="dashboard-chart-total">Всего: <strong>{total}</strong></div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8 }} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8A1538"
            strokeWidth={2}
            dot={{ fill: '#8A1538', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
