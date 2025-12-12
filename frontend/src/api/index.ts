import type { FoodItem } from "../types/cart";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllMenu = async () => {
    const response = await fetch(`${BASE_URL}/foods`);
    return response.json();
}

export const getCategory = async (category: string) => {
    const response = await fetch(`${BASE_URL}/foods/${category}`);
    return response.json();
}

// Cart API

export const getCart = async () => {
    const response = await fetch(`${BASE_URL}/cart`);
    return response.json();
}

export const addToCart = async (foodId: string, quantity: number) => {
    const response = await fetch(`${BASE_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ foodId, quantity })
    });
    return response.json();
}

export const updateCartItem = async (foodId: string, quantity: number) => {
    const response = await fetch(`${BASE_URL}/cart/${foodId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
    });
    return response.json();
}

export const removeFromCart = async (foodId: string) => {
    const response = await fetch(`${BASE_URL}/cart/${foodId}`, {
        method: 'DELETE'
    });
    return response.json();
}

export const clearCart = async () => {
    const response = await fetch(`${BASE_URL}/cart`, {
        method: 'DELETE'
    })
    return response.json();
}

// Register/Login API

export const registerUser = async (name: string, number: number, password: string) => {
    const response = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, number, password })
    })
    return response.json()
}

export const loginUser = async (number: number, password: string) => {
    const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number, password })
    })
    return response.json()
}

// Order API

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

export const getUserOrders = async () => {
    const response = await fetch(`${BASE_URL}/orders`);
    return response.json()
}

export const getOrderById = async (orderId: string) => {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`);
    return response.json()
}

