import { BASE_URL } from './config';
import type { LoginCredentials, RegisterData } from '../types/user';
import { handleApiError } from './utils';

export const registerUser = async (userData: RegisterData) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка регистрации');
    }
    return response.json();
};

export const loginUser = async (credentials: LoginCredentials) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка входа');
    }
    return response.json();
};

export const getCurrentUser = async () => {
    const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include'
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка проверки авторизации');
    }
    return response.json();
};

export const logoutUser = async () => {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка выхода');
    }
    return response.json();
};

export const updateUserName = async (name: string) => {
    const response = await fetch(`${BASE_URL}/auth/update-name`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка обновления имени');
    }
    return response.json();
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${BASE_URL}/auth/update-password`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка обновления пароля');
    }
    return response.json();
};