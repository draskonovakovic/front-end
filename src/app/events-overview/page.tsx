'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createEvent } from '@/lib/event';
import { getAllEvents } from '@/lib/event';
import withAuthGuard from '@/guard/authGuard';
import { useRouter } from 'next/navigation';
import socket, { connectSocket, disconnectSocket } from '@/lib/socket';

type EventData = {
    id: number;
    title: string;
    description: string;
    date_time: string;
    location: string;
};

type FormData = {
  title: string;
  description: string;
  dateTime: Date;
  location: string;
};

function EventOverview() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken' && !event.newValue) {
        setIsAuthenticated(false);
        router.replace('/login'); 
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  useEffect(() => {
    connectSocket()
    
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        setEvents(data);
      } catch (error: any) {
        alert(error.message);
      }
    };
    fetchEvents();

    socket.on('newEvent', (newEvent: EventData) => {
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    });

    return () => {
      socket.off('newEvent');
      disconnectSocket();
    };

    }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await createEvent({
        title: data.title,
        description: data.description,
        date_time: data.dateTime,
        location: data.location,
      });
      alert('Event created successfully!');
      setIsOpen(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Events</h1>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Date & Time</th>
              <th className="border border-gray-300 px-4 py-2">Location</th>
            </tr>
          </thead>
          <tbody>
          {Array.isArray(events) && events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id}>
                  <td className="border border-gray-300 px-4 py-2">{event.title}</td>
                  <td className="border border-gray-300 px-4 py-2">{event.description}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(event.date_time).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{event.location}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">No events found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 transition focus:outline-none"
      >
        <span className="text-2xl font-bold">+</span>
      </button>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Create Event
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        {...register('title', { required: 'Title is required' })}
                        type="text"
                        id="title"
                        className={`w-full px-3 py-2 border rounded ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <input
                        {...register('description', { required: 'Description is required' })}
                        type="text"
                        id="description"
                        className={`w-full px-3 py-2 border rounded ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="dateTime" className="block text-sm font-medium mb-1">
                        Date and Time
                      </label>
                      <input
                        {...register('dateTime', { required: 'Date and time is required' })}
                        type="datetime-local"
                        id="dateTime"
                        className={`w-full px-3 py-2 border rounded ${
                          errors.dateTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dateTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.dateTime.message}</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <input
                        {...register('location', { required: 'Location is required' })}
                        type="text"
                        id="location"
                        className={`w-full px-3 py-2 border rounded ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default withAuthGuard(EventOverview);