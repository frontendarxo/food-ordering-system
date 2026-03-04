import { useState, useEffect, useCallback } from 'react';
import { fetchWorkerDashboard } from '../api/dashboardApi';
import { useDashboardWs } from './useDashboardWs';
import type { WorkerDashboardData } from '../api/types';

export function useWorkerDashboard() {
  const [data, setData] = useState<WorkerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchWorkerDashboard();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useDashboardWs(refetch, true);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
