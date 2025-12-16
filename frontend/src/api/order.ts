import type { FoodItem } from "../types/cart";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getUserOrders = async () => {
    const response = await fetch(`${BASE_URL}/orders`);
    return response.json()
}

export const getOrderById = async (orderId: string) => {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`);
    return response.json()
}


export const createOrder = async (foods: FoodItem[]) => {
    const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ foods })
    })
    return response.json()
}


