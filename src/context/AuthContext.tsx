'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser } from '@/lib/auth';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { clearAuthToken, getAuthToken } from '@/utilis/authHelpers';
import { useRouter } from 'next/navigation';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.AUTH_TOKEN) {
        setIsAuthenticated(!!event.newValue);
        router.replace('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = () => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  };

  const logout = async () => {
    await logoutUser();
    clearAuthToken(); 
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
