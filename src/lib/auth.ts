import { clearAuthToken, setAuthToken } from '@/utilis/authHelpers';
import api from './api';

export const registerUser = async (data: { name: string; surname: string; email: string; password: string }) => {
  try {
      const response = await api.post('/users/', data);
      if (!response || !response.data) {
          throw new Error("Unexpected response: Response or data is undefined.");
      }
      return response.data;
  } catch (error: any) {
      throw new Error(error.message || "An error occurred while registering.");
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
      const response = await api.post('/auth/login', data);
      if (!response || !response.data) {
          throw new Error("Unexpected response: Response or data is undefined.");
      }
      const { token } = response.data;

      setAuthToken(token);
      return response.data;
  } catch (error: any) {
      throw new Error(error.message || "An error occurred during login.");
  }
};

export const logoutUser = async () => {
  try {
      clearAuthToken();
  } catch (error: any) {
      throw new Error(error.message || "An error occurred during logout.");
  }
};
