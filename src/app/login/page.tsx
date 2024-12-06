'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { loginUser } from '@/lib/auth';
import socket, { connectSocket, disconnectSocket } from '@/lib/socket';

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | ''>('');
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    mode: 'onBlur',
  });
  const { login } = useAuth(); 
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await loginUser(data); 
      console.log('Login successful:', response);

      login()

      router.push('/events-overview'); 
    } catch (error: any) {
      setServerError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-bold text-green-600 mb-4 text-center">Login</h1>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format',
              },
            })}
            type="email"
            id="email"
            className={`w-full px-3 py-2 border rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            {...register('password', {
              required: 'Password is required',
            })}
            type="password"
            id="password"
            className={`w-full px-3 py-2 border rounded ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-red-500 text-sm mt-1">{serverError}</p>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          Login
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-green-600 hover:underline"
            >
              Register here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}