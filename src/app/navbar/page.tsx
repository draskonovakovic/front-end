'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    closeModal(); 
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div
          className="text-green-600 text-xl font-bold cursor-pointer"
          onClick={() => router.push('/')}
        >
          Event Planning App
        </div>

        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => router.push('/attendance-dashboard')}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Attendance Overview
              </button>
              <button
                onClick={() => router.push('/events-overview')}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Event Overview
              </button>
              <button
                onClick={openModal} 
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 text-center">
            <h2 className="text-lg font-bold mb-4">Are you sure you want to log out?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-400"
              >
                Yes
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
