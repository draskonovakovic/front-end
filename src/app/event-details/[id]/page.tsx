'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { getEventById } from '@/lib/event'; 
import { getUserById } from '@/lib/user'; 
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getAuthToken } from '@/utilis/authHelpers';
import { EventData } from '@/types/event';
import { UserData } from '@/types/user';

function EventDetails() {
  const { id } = useParams(); 
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [event, setEvent] = useState<EventData>();
  const [user, setUser] = useState<UserData>(); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | ''>('');

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
      console.error("Error formatting date:", error);
      return "Invalid date";
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
        throw new Error("Event not found");
      }
      setEvent(eventData);

      if (eventData.creator_id) {
        const userData = await getUserById(eventData.creator_id);
        if (!userData) {
          throw new Error("User not found");
        }
        setUser(userData);
      }
    } catch (err: any) {
      console.error("Error fetching event data:", err.message || err);
      setError(err.message || "Failed to load event data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);

    if (id) {
      fetchEventData(id);
    } else {
      setError("Invalid event ID.");
      setLoading(false);
    }

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
          <p className="text-lg font-medium text-gray-800">Date: <span className="text-gray-600">{formatDate(event.date_time)}</span></p>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200"></div>

        {/* User Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Created By</h2>
          <p className="text-lg text-gray-600">Name: {user.name} {user.surname}</p>
          <p className="text-lg text-gray-600">Email: {user.email}</p>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
