import axios from 'axios';
import { useRouter } from 'next/navigation';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const router = useRouter();
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      router.push('/');
    }

    return Promise.reject(error);
  }
);

export default api;
