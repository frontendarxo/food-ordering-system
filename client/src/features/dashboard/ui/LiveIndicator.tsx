import { memo } from 'react';
import './LiveIndicator.css';

export const LiveIndicator = memo(function LiveIndicator() {
  return (
    <span className="dashboard-live" title="Обновления в реальном времени">
      <span className="dashboard-live-dot" />
      Live
    </span>
  );
});
