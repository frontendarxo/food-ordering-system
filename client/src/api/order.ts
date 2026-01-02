import { BASE_URL } from './config';
import { handleApiError } from './utils';

const getHeaders = () => ({
    'Content-Type': 'application/json'
});

export const getUserOrders = async () => {
    const response = await fetch(`${BASE_URL}/orders`, {
        headers: getHeaders(),
        credentials: 'include'
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка загрузки заказов');
    }
    
    return response.json();
};

export const getOrderById = async (orderId: string) => {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        headers: getHeaders(),
        credentials: 'include'
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка загрузки заказа');
    }
    
    return response.json();
};

export const createOrder = async (address: string) => {
    const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ address })
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка создания заказа');
    }
    
    return response.json();
};


