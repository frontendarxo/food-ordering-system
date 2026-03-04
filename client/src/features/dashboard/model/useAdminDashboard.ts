import { useState, useEffect, useCallback } from 'react';
import { fetchAdminDashboard } from '../api/dashboardApi';
import type { DashboardDateRange } from '../api/dashboardApi';
import { useDashboardWs } from './useDashboardWs';
import type { AdminDashboardData } from '../api/types';

export function useAdminDashboard(dateRange: DashboardDateRange | null = null) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchAdminDashboard(dateRange ?? undefined);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [dateRange?.startDate, dateRange?.endDate]);

  const { connected } = useDashboardWs(refetch, true);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, wsConnected: connected };
}
