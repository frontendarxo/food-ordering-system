const BASE_URL = import.meta.env.VITE_BASE_URL;

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