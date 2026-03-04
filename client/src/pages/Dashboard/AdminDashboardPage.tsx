import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboardContent } from '../../features/dashboard/ui/AdminDashboardContent';
import { DashboardDateFilter } from '../../features/dashboard/ui/DashboardDateFilter';
import { DashboardError } from '../../features/dashboard/ui/DashboardError';
import { DashboardSkeleton } from '../../features/dashboard/ui/DashboardSkeleton';
import { useAdminDashboard } from '../../features/dashboard/model/useAdminDashboard';
import { useAuth } from '../../contexts/useAuth';
import type { DashboardDateRange } from '../../features/dashboard/api/dashboardApi';

export const AdminDashboardPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [dateRange, setDateRange] = useState<DashboardDateRange | null>(null);
  const { data, loading, error, refetch, wsConnected } = useAdminDashboard(dateRange);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user && user.role !== 'admin') {
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
    <div className="dashboard-admin-page">
      <DashboardDateFilter value={dateRange} onChange={setDateRange} />
      <AdminDashboardContent data={data} dateRange={dateRange} wsConnected={wsConnected} />
    </div>
  );
};
