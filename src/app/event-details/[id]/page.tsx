'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; 
import { getEventById } from '@/lib/event'; 
import { getUserById } from '@/lib/user'; 
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation';

function EventDetails() {
  const { id } = useParams(); 
  const { isAuthenticated } = useAuth(); 
  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null); 
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login'); 
      return;
    }

    if (id) {
      const fetchEvent = async () => {
        try {
          const eventData = await getEventById(+id); 
          setEvent(eventData);

          if (eventData && eventData.creator_id) {
            const userData = await getUserById(eventData.creator_id); 
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching event:', error);
        }
      };
      fetchEvent();
    }
  }, [id, isAuthenticated, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, 
    });
  };

  if (!event || !user) return <div>Loading...</div>;

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
