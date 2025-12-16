const BASE_URL = import.meta.env.VITE_BASE_URL;

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
