'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import withAuthGuard from '@/guard/authGuard';
import { createEvent, getAllEvents } from '@/lib/event';
import socket, { connectSocket, disconnectSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { EventData } from '@/types/event';
import { EVENT_TYPES } from '@/constants/eventTypes';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getAuthToken } from '@/utilis/authHelpers';

type FormData = {
  title: string;
  description: string;
  dateTime: Date;
  location: string;
  type: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  extendedProps: {
    description: string;
    location: string;
    type: string;
  };
};

function EventOverview() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const eventTypes = EVENT_TYPES;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onBlur' });

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.AUTH_TOKEN && !event.newValue) {
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
    connectSocket();

    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        const formattedEvents = data.map((event: EventData) => ({
          id: event.id,
          title: event.title,
          start: event.date_time,
          extendedProps: {
            description: event.description,
            location: event.location,
            type: event.type,
          },
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();

    socket.on('newEvent', (newEvent: EventData) => {
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: newEvent.id.toString(),
          title: newEvent.title,
          start: newEvent.date_time,
          end: newEvent.date_time,
          extendedProps: {
            description: newEvent.description,
            location: newEvent.location,
            type: newEvent.type,
          },
        },
      ]);
    });

    return () => {
      socket.off('newEvent');
      disconnectSocket();
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await createEvent({
        title: data.title,
        description: data.description,
        date_time: data.dateTime,
        location: data.location,
        type: data.type,
      });
  
      console.log("Kreirani event: ", response)
      if (!response.success) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      alert('Event created successfully!');
      setIsOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'An unknown error occurred';
      alert(`Failed to create event: ${errorMessage}`);
    }
  };  

  const handleEventClick = (info: any) => {
    const event = info.event;
    alert(
      `Event Details:
      Title: ${event.title}
      Description: ${event.extendedProps.description}
      Location: ${event.extendedProps.location}
      Type: ${event.extendedProps.type}`
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Event Calendar</h1>

      {/* Calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventColor="green"
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={true}
        selectable={true}
        height="auto"
      />

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-green-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-500 transition focus:outline-none z-50"
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Create Event
                  </Dialog.Title>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Title */}
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        {...register('title', {
                          required: 'Title is required',
                          minLength: { value: 3, message: 'Title must be at least 3 characters' },
                        })}
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

                    {/* Description */}
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        {...register('description', {
                          required: 'Description is required',
                          minLength: { value: 10, message: 'Description must be at least 10 characters' },
                        })}
                        id="description"
                        className={`w-full px-3 py-2 border rounded ${
                          errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                      ></textarea>
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    {/* DateTime */}
                    <div className="mb-4">
                      <label htmlFor="dateTime" className="block text-sm font-medium mb-1">
                        Date and Time
                      </label>
                      <input
                        {...register('dateTime', {
                          required: 'Date and Time are required',
                          validate: {
                            isValidDate: (value) => {
                              const date = new Date(value);
                              return date > new Date() || 'Date and Time must be in the future';
                            },
                          },
                        })}
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

                    {/* Location */}
                    <div className="mb-4">
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <input
                        {...register('location', {
                          required: 'Location is required',
                          minLength: { value: 3, message: 'Location must be at least 3 characters' },
                        })}
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

                    {/* Type */}
                    <div className="mb-4">
                      <label htmlFor="type" className="block text-sm font-medium mb-1">
                        Type
                      </label>
                      <select
                        {...register('type', {
                          required: 'Type is required',
                          validate: {
                            isValidType: (value) =>
                              eventTypes.includes(value) || `Type must be one of: ${eventTypes.join(', ')}`,
                          },
                        })}
                        id="type"
                        className={`w-full px-3 py-2 border rounded ${
                          errors.type ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Type</option>
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
                    >
                      Save
                    </button>
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
