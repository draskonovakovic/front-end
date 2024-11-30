'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser } from '@/lib/auth';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    // Osluškivanje promena u `localStorage`
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        setIsAuthenticated(!!event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = () => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('authToken'); // Ukloni token prilikom logouta
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
