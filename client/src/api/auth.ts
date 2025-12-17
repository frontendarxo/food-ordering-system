const BASE_URL = import.meta.env.VITE_BASE_URL;
import type { User, LoginCredentials } from '../types/user';

export const registerUser = async (user: User) => {
    const response = await fetch(`${BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user })
    })
    return response.json()
}

export const loginUser = async (user: LoginCredentials) => {
    const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    return response.json()
}