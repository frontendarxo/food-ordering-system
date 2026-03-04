import { memo } from 'react';
import './LiveIndicator.css';

interface LiveIndicatorProps {
  connected: boolean;
}

export const LiveIndicator = memo(function LiveIndicator({ connected }: LiveIndicatorProps) {
  if (connected) {
    return (
      <span className="dashboard-live dashboard-live--on" title="Обновления в реальном времени">
        <span className="dashboard-live-dot" />
        Live
      </span>
    );
  }
  return (
    <span className="dashboard-live dashboard-live--off" title="Нет соединения, данные обновляются по запросу">
      <span className="dashboard-live-dot" />
      Офлайн
    </span>
  );
});
