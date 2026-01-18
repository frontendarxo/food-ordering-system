import { BASE_URL } from './config';
import { handleApiError } from './utils.js';

export interface LoginResponse {
  success: boolean;
  user: {
    role: 'admin' | 'worker';
  };
}

export interface UserResponse {
  user: {
    role: 'admin' | 'worker';
  };
}

export const login = async (login: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ login, password }),
  });

  if (!response.ok) {
    await handleApiError(response, 'Ошибка входа');
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response, 'Ошибка выхода');
  }
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response, 'Ошибка получения пользователя');
  }

  return response.json();
};

