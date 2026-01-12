import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../constants/auth';
import { AuthContext } from './authContext';

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
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const login = (login: string, password: string): boolean => {
    if (login === 'admin' && password === 'admin123') {
      setUser({ role: 'admin' });
      return true;
    }
    if (login === 'worker' && password === 'worker123') {
      setUser({ role: 'worker' });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};



