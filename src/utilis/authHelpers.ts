import { STORAGE_KEYS } from '@/constants/storageKeys';

export const setAuthToken = (token: string) => {
  try {
    if (typeof token !== 'string') {
      throw new Error('Provided token must be a string');
    }
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
};

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null; 
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};


export const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;

    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        return decodedToken.exp * 1000 > Date.now();
    } catch (err) {
        return false;
    }
};