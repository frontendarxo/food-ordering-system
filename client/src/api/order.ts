import { BASE_URL } from './config';
import { handleApiError } from './utils';
import type { Order } from '../types/order';

const getHeaders = () => ({
    'Content-Type': 'application/json'
});

interface CreateOrderData {
    phoneNumber: string;
    items: Array<{ food: string; quantity: number }>;
    deliveryMethod: 'самовызов' | 'доставка';
    address?: string;
    paymentMethod: 'наличка' | 'карта';
    location: 'шатой' | 'гикало';
}

export const createOrder = async (orderData: CreateOrderData) => {
    const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка создания заказа');
    }
    
    return response.json();
};

export const getAllOrders = async (): Promise<{ orders: Order[] }> => {
    const response = await fetch(`${BASE_URL}/orders`, {
        credentials: 'include',
        headers: getHeaders(),
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка загрузки заказов');
    }
    
    return response.json();
};

export const updateOrderStatus = async (id: string, status: string) => {
    const response = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка обновления статуса заказа');
    }
    
    return response.json();
};

export const deleteOrder = async (id: string) => {
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
    });

    if (!response.ok) {
        await handleApiError(response, 'Ошибка удаления заказа');
    }

    return response.json();
};


