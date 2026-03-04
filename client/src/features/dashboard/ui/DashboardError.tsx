import { memo } from 'react';
import './DashboardError.css';

interface DashboardErrorProps {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}

export const DashboardError = memo(function DashboardError({
  message,
  onRetry,
  retrying = false,
}: DashboardErrorProps) {
  return (
    <div className="dashboard-error">
      <div className="dashboard-error-card">
        <p className="dashboard-error-message">{message}</p>
        <p className="dashboard-error-hint">Проверьте соединение и попробуйте снова.</p>
        <button
          type="button"
          className="dashboard-error-retry"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? 'Загрузка…' : 'Повторить'}
        </button>
      </div>
    </div>
  );
});
