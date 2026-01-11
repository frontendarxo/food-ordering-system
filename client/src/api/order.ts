import { BASE_URL } from './config';
import { handleApiError } from './utils';

const getHeaders = () => ({
    'Content-Type': 'application/json'
});

interface CreateOrderData {
    phoneNumber: string;
    items: Array<{ food: string; quantity: number }>;
    deliveryMethod: 'самовызов' | 'доставка';
    address?: string;
    paymentMethod: 'наличка' | 'карта';
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


