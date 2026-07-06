import { BASE_URL } from '../../../api/config';
import { handleApiError } from '../../../api/utils';
import type { AdminDashboardData, WorkerDashboardData } from './types';

const getHeaders = () => ({ 'Content-Type': 'application/json' });

export interface DashboardDateRange {
  startDate: string;
  endDate: string;
}

function buildDashboardUrl(params?: DashboardDateRange): string {
  const url = new URL(`${BASE_URL}/dashboard/admin`);
  if (params?.startDate) url.searchParams.set('startDate', params.startDate);
  if (params?.endDate) url.searchParams.set('endDate', params.endDate);
  return url.toString();
}

export const fetchAdminDashboard = async (
  params?: DashboardDateRange
): Promise<AdminDashboardData> => {
  const response = await fetch(buildDashboardUrl(params), {
    credentials: 'include',
    headers: getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    await handleApiError(response, 'Ошибка загрузки дашборда');
  }
  return response.json();
};

export const fetchWorkerDashboard = async (): Promise<WorkerDashboardData> => {
  const response = await fetch(`${BASE_URL}/dashboard/worker`, {
    credentials: 'include',
    headers: getHeaders(),
    cache: 'no-store',
  });
  if (!response.ok) {
    await handleApiError(response, 'Ошибка загрузки дашборда');
  }
  return response.json();
};
