'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEventById, updateEvent } from '@/lib/event'; 
import { getUserById } from '@/lib/user';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getAuthToken } from '@/utilis/authHelpers';
import { EventData } from '@/types/event';
import { UserData } from '@/types/user';
import { EVENT_TYPES } from '@/constants/eventTypes';

function EventDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [event, setEvent] = useState<EventData>();
  const [user, setUser] = useState<UserData>(); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | ''>('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedEvent, setUpdatedEvent] = useState<EventData>();

  const formatDate = (dateString: string | null | undefined) => {
    try {
      if (!dateString) {
        throw new Error("Date string is null or undefined");
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid Date");
      }
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.AUTH_TOKEN && !event.newValue) {
      setIsAuthenticated(false);
      router.replace('/login');
    }
  };

  const fetchEventData = async (eventId: string | string[]) => {
    try {
      const eventData = await getEventById(+eventId);
      if (!eventData) {
        throw new Error('Event not found');
      }
      setEvent(eventData);
      setUpdatedEvent(eventData); 

      if (eventData.creator_id) {
        const userData = await getUserById(eventData.creator_id);
        if (!userData) {
          throw new Error('User not found');
        }
        setUser(userData);
      }
    } catch (err: any) {
      console.error('Error fetching event data:', err.message || err);
      setError(err.message || 'Failed to load event data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = () => {
    setIsUpdateModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedEvent((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      if (!updatedEvent) {
        throw new Error("updatedEvent is undefined");
      }

      if (!updatedEvent.id) {
        throw new Error("Event ID is missing");
      }

      const response = await updateEvent(updatedEvent.id, updatedEvent);

      if (!response) {
        throw new Error("No response received from updateEvent API");
      }

      setEvent(updatedEvent);
      setIsUpdateModalOpen(false);
      alert('Event updated successfully!');
    } catch (error: any) {
      console.error('Error updating event:', error.message || error);
      alert(`Failed to update event: ${error.message || 'Unknown error'}`);
    }
  };


  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  
    if (!id) {
      setError("Undefined event ID.");
      setLoading(false);
      return; 
    }
  
    fetchEventData(id);
  
    const handleStorageChange = () => {
      const updatedToken = getAuthToken();
      setIsAuthenticated(!!updatedToken);
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!event || !user) {
    return <div className="text-red-500">Unexpected error occurred.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        {/* Event Title and Description */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{event.title}</h1>

        {/* Event Details */}
        <div className="space-y-4">
          <p className="text-lg font-medium text-gray-800">Description: <span className="text-gray-600">{event.description}</span></p>
          <p className="text-lg font-medium text-gray-800">Location: <span className="text-gray-600">{event.location}</span></p>
          <p className="text-lg font-medium text-gray-800">Type: <span className="text-gray-600">{event.type}</span></p>
          <p className="text-lg font-medium text-gray-800">Date: <span className="text-gray-600">{formatDate(event.date_time.toString())}</span></p>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200"></div>

        {/* User Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Created By</h2>
          <p className="text-lg text-gray-600">Name: {user.name} {user.surname}</p>
          <p className="text-lg text-gray-600">Email: {user.email}</p>
        </div>

        <button
          onClick={handleUpdateClick}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-400"
        >
          Update Event
        </button>

        {isUpdateModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md w-1/2">
              <h2 className="text-xl font-bold mb-4">Update Event</h2>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={updatedEvent?.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded ${
                      updatedEvent!.title?.trim().length >= 3 ? 'border-gray-300' : 'border-red-500'
                    }`}
                    placeholder="Enter title"
                  />
                  {updatedEvent!.title?.trim().length < 3 && (
                    <p className="text-red-500 text-sm">Title must be at least 3 characters long.</p>
                  )}
                </div>
          
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={updatedEvent?.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded ${
                      updatedEvent!.description?.trim().length >= 10 ? 'border-gray-300' : 'border-red-500'
                    }`}
                    placeholder="Enter description"
                  />
                  {updatedEvent!.description?.trim().length < 10 && (
                    <p className="text-red-500 text-sm">Description must be at least 10 characters long.</p>
                  )}
                </div>
          
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={updatedEvent?.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded ${
                      updatedEvent!.location?.trim().length >= 3 ? 'border-gray-300' : 'border-red-500'
                    }`}
                    placeholder="Enter location"
                  />
                  {updatedEvent!.location?.trim().length < 3 && (
                    <p className="text-red-500 text-sm">Location must be at least 3 characters long.</p>
                  )}
                </div>
          
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    name="type"
                    value={updatedEvent?.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded border-gray-300"
                  >
                    <option value="">Select Type</option>
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {!EVENT_TYPES.includes(updatedEvent!.type) && (
                    <p className="text-red-500 text-sm">Please select a valid event type.</p>
                  )}
                </div>
          
                {/* Date and Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    name="date_time"
                    value={updatedEvent?.date_time?.toString().slice(0, 16)} 
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded ${
                      updatedEvent?.date_time && new Date(updatedEvent.date_time) > new Date()
                        ? 'border-gray-300'
                        : 'border-red-500'
                    }`}
                  />
                  {(!updatedEvent?.date_time ||
                    new Date(updatedEvent.date_time) <= new Date()) && (
                    <p className="text-red-500 text-sm">Date must be in the future.</p>
                  )}
                </div>
              </div>
          
              {/* Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={
                    !updatedEvent?.title?.trim() ||
                    updatedEvent.title.trim().length < 3 ||
                    !updatedEvent.description?.trim() ||
                    updatedEvent.description.trim().length < 10 ||
                    !updatedEvent.location?.trim() ||
                    updatedEvent.location.trim().length < 3 ||
                    !EVENT_TYPES.includes(updatedEvent.type) ||
                    !updatedEvent.date_time ||
                    new Date(updatedEvent.date_time) <= new Date()
                  }
                  className={`px-4 py-2 text-white rounded ${
                    !updatedEvent?.title?.trim() ||
                    updatedEvent.title.trim().length < 3 ||
                    !updatedEvent.description?.trim() ||
                    updatedEvent.description.trim().length < 10 ||
                    !updatedEvent.location?.trim() ||
                    updatedEvent.location.trim().length < 3 ||
                    !EVENT_TYPES.includes(updatedEvent.type) ||
                    !updatedEvent.date_time ||
                    new Date(updatedEvent.date_time) <= new Date()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-400'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>                
        )}
      </div>
    </div>
  );
}

export default EventDetails;