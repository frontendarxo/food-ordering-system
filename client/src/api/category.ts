import { BASE_URL } from "./config";
import { handleApiError } from "./utils";

export const createCategory = async (name: string) => {
    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name }),
            credentials: 'include'
        });
        if (!response.ok) {
            await handleApiError(response, 'Ошибка создания категории');
        }
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const getAllCategories = async () => {
    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            credentials: 'include'
        });
        if (!response.ok) {
            await handleApiError(response, 'Ошибка получения категорий');
        }
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const updateCategory = async (id: string, name: string) => {
    try {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name }),
            credentials: 'include'
        });
        if (!response.ok) {
            await handleApiError(response, 'Ошибка обновления категории');
        }
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

interface Category {
    _id: string;
    name: string;
}

export const updateCategoryByName = async (oldName: string, newName: string) => {
    try {
        const categories: Category[] = await getAllCategories();
        const category = categories.find((cat) => cat.name === oldName);
        if (!category) {
            throw new Error('Категория не найдена');
        }
        return await updateCategory(category._id, newName);
    } catch (error) {
        console.error(error);
        throw error;
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
        if (response.status === 204) {
            return { message: 'Категория удалена успешно' };
        }
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const deleteCategoryByName = async (name: string) => {
    try {
        const categories: Category[] = await getAllCategories();
        const category = categories.find((cat) => cat.name === name);
        if (!category) {
            throw new Error('Категория не найдена');
        }
        return await deleteCategory(category._id);
    } catch (error) {
        console.error(error);
        throw error;
    }
}