const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllMenu = async () => {
    const response = await fetch(`${BASE_URL}/foods`);
    return response.json();
}

export const getCategory = async (category: string) => {
    const response = await fetch(`${BASE_URL}/foods/${category}`);
    return response.json();
}
