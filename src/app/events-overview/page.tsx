'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import withAuthGuard from '@/guard/authGuard';
import { createEvent, getFilteredEvents } from '@/lib/event'; 
import socket, { connectSocket, disconnectSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';
import { EventData } from '@/types/event';
import { EVENT_TYPES } from '@/constants/eventTypes';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getAuthToken } from '@/utilis/authHelpers';

type FormData = {
  id: number;
  title: string;
  description: string;
  dateTime: Date;
  location: string;
  type: string;
  creator_id: number;
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

type Filters = {
  date: string;
  active: string;
  type: string;
  search: string;
};

function EventOverview() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    date: '',
    active: '',
    type: '',
    search: '',
  });
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

    socket.on('newEvent', (newEvent: EventData) => {
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: newEvent.id.toString(),
          title: newEvent.title,
          start: newEvent.date_time.toString(),
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

  const fetchEvents = async () => {
    try {
      const data = await getFilteredEvents(filters); 
      const formattedEvents = data
        .filter((event: EventData) => {
          return event.id && event.title && event.date_time && event.description && event.location && event.type;
        })
        .map((event: EventData) => ({
          id: event.id.toString(),
          title: event.title,
          start: event.date_time.toString(),
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

  useEffect(() => {
    fetchEvents(); 
  }, [filters]); 

  const onSubmit = async (data: FormData) => {
    try {
      const response = await createEvent({
        title: data.title,
        description: data.description,
        date_time: data.dateTime,
        location: data.location,
        type: data.type,
      });

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
    try {
      if (!info?.event) {
        throw new Error("Event information is missing.");
      }

      const eventId = info.event.id;

      if (!eventId) {
        throw new Error("Event ID is missing.");
      }

      router.push(`/event-details/${eventId}`);
    } catch (error: any) {
      console.error("Error in handleEventClick:", error.message || error);
      alert(`Failed to navigate to event details: ${error.message || "Unknown error occurred."}`);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSearchClick = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search: prevFilters.search, 
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Event Calendar</h1>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          className="p-2 border rounded"
          placeholder="Select date"
        />
        <select
          name="active"
          value={filters.active}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="">Status</option>
          <option value="true">ACTIVE</option>
          <option value="false">CANCELED</option>
        </select>
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        >
          <option value="">Event Type</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="relative">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="p-2 border rounded pr-10"
            placeholder="Search events"
          />
          <button
            type="button"
            onClick={handleSearchClick}
            className="absolute right-2 top-2 text-gray-500"
          >
            🔍
          </button>
        </div>
      </div>

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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create Event
                  </Dialog.Title>
                  <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded"
                        placeholder="Event Title"
                        {...register('title', { required: 'Title is required' })}
                      />
                      {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        className="w-full px-4 py-2 border rounded"
                        placeholder="Event Description"
                        {...register('description', { required: 'Description is required' })}
                      />
                      {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-2 border rounded"
                        {...register('dateTime', { required: 'Date and Time are required' })}
                      />
                      {errors.dateTime && <span className="text-red-500 text-xs">{errors.dateTime.message}</span>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded"
                        placeholder="Location"
                        {...register('location', { required: 'Location is required' })}
                      />
                      {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Event Type</label>
                      <select
                        className="w-full px-4 py-2 border rounded"
                        {...register('type', { required: 'Event type is required' })}
                      >
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.type && <span className="text-red-500 text-xs">{errors.type.message}</span>}
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-700 text-white rounded"
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
