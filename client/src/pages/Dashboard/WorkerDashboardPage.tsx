import { Navigate } from 'react-router-dom';
import { DashboardError } from '../../features/dashboard/ui/DashboardError';
import { WorkerDashboardContent } from '../../features/dashboard/ui/WorkerDashboardContent';
import { DashboardSkeleton } from '../../features/dashboard/ui/DashboardSkeleton';
import { useWorkerDashboard } from '../../features/dashboard/model/useWorkerDashboard';
import { useAuth } from '../../contexts/useAuth';

const LOCATION_LABELS: Record<string, string> = {
  шатой: 'Шатой',
  гикало: 'Гикало',
};

export const WorkerDashboardPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { data, loading, error, refetch, wsConnected } = useWorkerDashboard();
  const locationLabel = user?.location ? LOCATION_LABELS[user.location] ?? user.location : 'Локация';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user && user.role !== 'worker') {
    return <Navigate to="/" replace />;
  }

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError message={error} onRetry={refetch} />;
  }

  if (!data) {
    return null;
  }

  return (
    <WorkerDashboardContent
      data={data}
      locationLabel={locationLabel}
      wsConnected={wsConnected}
    />
  );
};
