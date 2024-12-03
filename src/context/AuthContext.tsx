'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser } from '@/lib/auth';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);  

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);  
    } else {
      setIsAuthenticated(false); 
    }

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

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });
      setIsAuthenticated(true);  
    } catch (error: any) {
      console.error("Login failed:", error.message);
    }
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }

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
