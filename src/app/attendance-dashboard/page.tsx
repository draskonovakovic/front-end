'use client';

import { useEffect, useState } from 'react';
import { getEventsWithStatistics } from '@/lib/event'; 
import { EventStats } from '@/types/eventStats';

const AttendanceDashboard = () => {
  const [events, setEvents] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEventsWithStatistics();
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container">
      <h1>Attendance Dashboard</h1>
      <div className="card-grid">
        {events.map((eventStat) => (
          <div key={eventStat.event.id} className="card">
            <h2>{eventStat.event.title}</h2>
            <p>{eventStat.event.description}</p>
            <div className="stats">
              <p>Accepted Invitations: {eventStat.aceptedInvitationsNum}</p>
              <p>Pending Invitations: {eventStat.pendingInvitationsNum}</p>
              <p>Declined Invitations: {eventStat.declinedInvitationsNum}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceDashboard;
