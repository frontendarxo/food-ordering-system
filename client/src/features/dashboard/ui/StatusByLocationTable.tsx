import { memo, useMemo } from 'react';
import type { OrdersByStatusByLocationItem } from '../api/types';
import './StatusByLocationTable.css';

interface StatusByLocationTableProps {
  data: OrdersByStatusByLocationItem[];
}

interface LocationRow {
  location: string;
  pending: number;
  confirmed: number;
  cancelled: number;
  total: number;
}

function groupByLocation(
  data: OrdersByStatusByLocationItem[]
): LocationRow[] {
  const map = new Map<string, { pending: number; confirmed: number; cancelled: number }>();
  for (const item of data) {
    const loc = String(item.location ?? '').trim() || '—';
    const status = String(item.status ?? '').trim().toLowerCase();
    const count = Number(item.count) || 0;
    if (!map.has(loc)) map.set(loc, { pending: 0, confirmed: 0, cancelled: 0 });
    const row = map.get(loc)!;
    if (status === 'pending') row.pending += count;
    else if (status === 'confirmed') row.confirmed += count;
    else if (status === 'cancelled') row.cancelled += count;
  }
  return Array.from(map.entries())
    .map(([location, counts]) => ({
      location,
      ...counts,
      total: counts.pending + counts.confirmed + counts.cancelled,
    }))
    .sort((a, b) => a.location.localeCompare(b.location));
}

export const StatusByLocationTable = memo(function StatusByLocationTable({
  data,
}: StatusByLocationTableProps) {
  const rows = useMemo(() => groupByLocation(data), [data]);

  if (rows.length === 0 || rows.every((r) => r.total === 0)) {
    return (
      <div className="dashboard-status-by-location">
        <h3 className="dashboard-chart-title">Статусы по локациям</h3>
        <div className="dashboard-chart-empty">Нет данных</div>
      </div>
    );
  }

  return (
    <div className="dashboard-status-by-location">
      <h3 className="dashboard-chart-title">Статусы по локациям</h3>
      <table className="dashboard-status-by-location-table">
        <thead>
          <tr>
            <th>Локация</th>
            <th>Ожидает</th>
            <th>Принят</th>
            <th>Отменён</th>
            <th>Всего</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.location}>
              <td>{row.location}</td>
              <td>{row.pending}</td>
              <td>{row.confirmed}</td>
              <td>{row.cancelled}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
