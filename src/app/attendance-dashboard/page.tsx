'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getEventsWithStatistics } from '@/lib/event'; 
import { EventStats } from '@/types/eventStats';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import withAuthGuard from '@/guard/authGuard';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getAuthToken } from '@/utilis/authHelpers';

const AttendanceDashboard = () => {
  const [events, setEvents] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const router = useRouter();

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
    return (
      <div className="error-container p-6 bg-light-green min-h-screen">
        <p className="error-message">You haven't organized any events yet.</p>
      </div>
    );
  }

  return (
    <div className="container p-6 bg-light-green min-h-screen">
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded shadow-md p-4 mb-6">
      <h2 className="text-2xl font-semibold">Attendance dashboard</h2>
      <p className="mt-2">See attendance statistics in chart pies. You can click on event cards and see event details.</p>
      </div>
      <div className="card-grid">
        {events.map((eventStat) => (
          <div
            key={eventStat.event.id}
            className="card"
            onClick={() => router.push(`/event-details/${eventStat.event.id}`)}
          >
            <div className="card-header">
              <h2>{eventStat.event.title}</h2>
              <p>{eventStat.event.description}</p>
            </div>
            <div className="card-body">
              {eventStat.aceptedInvitationsNum === 0 &&
              eventStat.pendingInvitationsNum === 0 &&
              eventStat.declinedInvitationsNum === 0 ? (
                <p>No invitations sent for this event.</p>
              ) : (
                <Pie
                  data={{
                    labels: ['Accepted', 'Pending', 'Declined'],
                    datasets: [
                      {
                        data: [
                          eventStat.aceptedInvitationsNum,
                          eventStat.pendingInvitationsNum,
                          eventStat.declinedInvitationsNum,
                        ],
                        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                    maintainAspectRatio: false,
                  }}
                  width={300} 
                  height={300} 
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s;
          cursor: pointer;
          background-color: #fff;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .card-header {
          padding: 16px;
          border-bottom: 1px solid #ddd;
        }
        .card-header h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }
        .card-body {
          padding: 16px;
        }
      `}</style>
    </div>
  );
};

export default withAuthGuard(AttendanceDashboard);
