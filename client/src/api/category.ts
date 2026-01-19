import { BASE_URL } from "./config";
import { handleApiError } from "./utils";

export const createCategory = async (name: string) => {


    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            body: JSON.stringify({ name }),
            credentials: 'include'
        });
        if (!response.ok) {
            await handleApiError(response, 'Ошибка создания категории');
        }
        return response.json();
        
    } catch (error) {
        console.error(error);
    }
}

export const updateCategory = async (id: string, name: string) => {
    try {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
            credentials: 'include'
        });
        if (!response.ok) {
            await handleApiError(response, 'Ошибка обновления категории');
        }
        return response.json();
    } catch (error) {
        console.error(error);
    }
}

export const deleteCategory = async (id: string) => {
    try {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) {
            await handleApiError(response, 'Ошибка удаления категории');
        }
        return response.json();
    } catch (error) {
        console.error(error);
    }
}