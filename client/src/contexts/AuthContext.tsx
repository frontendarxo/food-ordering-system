import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../constants/auth';
import { AuthContext } from './authContext';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '../api/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ role: UserRole } | null>(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.role && (parsed.role === 'admin' || parsed.role === 'worker')) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      const { user: loggedInUser } = await loginApi(login, password);
      setUser(loggedInUser);
      return true;
    } catch (error) {
      console.error('Ошибка входа:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};



