import type { CartItem } from './food';

export interface User {
  id: string;
  name: string;
  number: string;
  adress: string;
  cart: CartItem[];
}

export interface LoginCredentials {
  number: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}


