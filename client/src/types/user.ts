export interface User {
  id: string;
  name: string;
  number: string;
}

export interface RegisterData {
  name: string;
  number: string;
  password: string;
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


