import api from './api';

export const registerUser = async (data: { name: string; surname: string; email: string; password: string }) => {
    try {
      const response = await api.post("/users/", data);
      return response.data; 
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "An error occurred while registering.");
    }
};


