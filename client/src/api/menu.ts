import { BASE_URL } from './config';
import { handleApiError } from './utils';
import type { Food } from '../types/food';

export const getAllMenu = async () => {
    try {
        const response = await fetch(`${BASE_URL}/foods`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            await handleApiError(response, 'Ошибка загрузки меню');
        }
        
        return response.json();
    } catch (error) {
        console.error('Ошибка при запросе getAllMenu:', error);
        throw error;
    }
};

export const getCategory = async (category: string) => {
    const response = await fetch(`${BASE_URL}/foods/${category}`);
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка загрузки категории');
    }
    
    return response.json();
};

export const createFood = async (foodData: {
    name: string;
    price: number;
    category: string;
    image: File;
    inStock: boolean;
    locations: ('шатой' | 'гикало')[];
}): Promise<{ food: Food }> => {
    const formData = new FormData();
    formData.append('name', foodData.name);
    formData.append('price', foodData.price.toString());
    formData.append('category', foodData.category);
    formData.append('image', foodData.image);
    formData.append('inStock', foodData.inStock.toString());
    formData.append('locations', JSON.stringify(foodData.locations));

    const response = await fetch(`${BASE_URL}/foods`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка создания еды');
    }
    
    return response.json();
};

export const updateFoodPrice = async (id: string, price: number): Promise<{ food: Food }> => {
    const response = await fetch(`${BASE_URL}/foods/${id}/price`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price }),
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка обновления цены');
    }
    
    return response.json();
};

export const updateFoodStock = async (
    id: string, 
    inStock: boolean, 
    location?: 'шатой' | 'гикало'
): Promise<{ food: Food }> => {
    const response = await fetch(`${BASE_URL}/foods/${id}/stock`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inStock, location }),
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка обновления наличия');
    }
    
    return response.json();
};

export const updateFoodName = async (id: string, name: string): Promise<{ food: Food }> => {
    const response = await fetch(`${BASE_URL}/foods/${id}/name`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка обновления названия');
    }
    
    return response.json();
};

export const updateFoodImage = async (id: string, image: File): Promise<{ food: Food }> => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(`${BASE_URL}/foods/${id}/image`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка обновления изображения');
    }
    
    return response.json();
};

export const deleteFood = async (id: string) => {
    const response = await fetch(`${BASE_URL}/foods/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    
    if (!response.ok) {
        await handleApiError(response, 'Ошибка удаления еды');
    }
    
    return response.json();
};
