import { memo, useCallback } from 'react';
import type { DashboardDateRange } from '../api/dashboardApi';
import './DashboardDateFilter.css';

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getWeek(): DashboardDateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { startDate: toYYYYMMDD(start), endDate: toYYYYMMDD(end) };
}

function getMonth(): DashboardDateRange {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return { startDate: toYYYYMMDD(start), endDate: toYYYYMMDD(end) };
}

interface DashboardDateFilterProps {
  value: DashboardDateRange | null;
  onChange: (range: DashboardDateRange | null) => void;
}

export const DashboardDateFilter = memo(function DashboardDateFilter({
  value,
  onChange,
}: DashboardDateFilterProps) {
  const setPreset = useCallback(
    (preset: () => DashboardDateRange) => {
      onChange(preset());
    },
    [onChange]
  );

  const clearFilter = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const setCustom = useCallback(
    (startDate: string, endDate: string) => {
      if (startDate && endDate && startDate <= endDate) {
        onChange({ startDate, endDate });
      }
    },
    [onChange]
  );

  const isActive = value !== null;

  return (
    <div className="dashboard-date-filter">
      <span className="dashboard-date-filter-label">Период:</span>
      <div className="dashboard-date-filter-presets">
        <button
          type="button"
          className={`dashboard-date-filter-btn ${!isActive ? 'active' : ''}`}
          onClick={clearFilter}
        >
          Сегодня
        </button>
        <button
          type="button"
          className={`dashboard-date-filter-btn ${isActive && isWeek(value) ? 'active' : ''}`}
          onClick={() => setPreset(getWeek)}
        >
          Неделя
        </button>
        <button
          type="button"
          className={`dashboard-date-filter-btn ${isActive && isMonth(value) ? 'active' : ''}`}
          onClick={() => setPreset(getMonth)}
        >
          Месяц
        </button>
      </div>
      <div className="dashboard-date-filter-custom">
        <input
          type="date"
          className="dashboard-date-filter-input"
          value={value?.startDate ?? ''}
          max={value?.endDate ?? toYYYYMMDD(new Date())}
          onChange={(e) => {
            const start = e.target.value;
            if (value) setCustom(start, value.endDate);
            else if (start) setCustom(start, start);
          }}
        />
        <span className="dashboard-date-filter-sep">—</span>
        <input
          type="date"
          className="dashboard-date-filter-input"
          value={value?.endDate ?? ''}
          min={value?.startDate}
          max={toYYYYMMDD(new Date())}
          onChange={(e) => {
            const end = e.target.value;
            if (value) setCustom(value.startDate, end);
            else if (end) setCustom(end, end);
          }}
        />
      </div>
    </div>
  );
});

function isWeek(r: DashboardDateRange): boolean {
  const start = new Date(r.startDate);
  const end = new Date(r.endDate);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 6 && diff <= 8;
}

function isMonth(r: DashboardDateRange): boolean {
  const start = new Date(r.startDate);
  return start.getDate() === 1;
}
