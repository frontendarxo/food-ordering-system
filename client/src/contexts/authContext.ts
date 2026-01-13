import { createContext } from 'react';
import type { UserRole } from '../constants/auth';

export interface AuthContextType {
  user: { role: UserRole } | null;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

