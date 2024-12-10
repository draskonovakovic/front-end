'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  
import socket, { connectSocket, disconnectSocket } from '@/lib/socket';
import { EventNotification } from '@/types/notification';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  const router = useRouter(); 

  useEffect(() => {
    connectSocket();

    const handleEventReminder = (notification: EventNotification) => {
      setNotifications((prev) => [notification, ...prev]);
      setHasNewNotification(true);
    };

    const handleUpdatedEvent = (event: any) => {
      setNotifications((prev) => [
        { message: `Event "${event.title}" has been updated.`, event },
        ...prev,
      ]);
      setHasNewNotification(true);
    };

    // Dodaj event listener-e
    socket.on('event-reminder', handleEventReminder);
    socket.on('updatedEvent', handleUpdatedEvent);

    return () => {
      // Ukloni event listener-e
      socket.off('event-reminder', handleEventReminder);
      socket.off('updatedEvent', handleUpdatedEvent);

      disconnectSocket();
    };
  }, []);

  const toggleNotifications = () => {
    setIsVisible(!isVisible);
    setHasNewNotification(false); 
  };

  const toggleNotificationSelection = (index: number) => {
    setSelectedNotifications((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  const deleteSelectedNotifications = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((_, index) => !selectedNotifications.has(index))
    );
    setSelectedNotifications(new Set());
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    setSelectedNotifications(new Set());
  };

  const handleNotificationClick = (eventId: string) => {
    router.push(`/event-details/${eventId}`); 
  };

  const closeNotifications = () => {
    setIsVisible(false);
  };

  return (
    <div>
      {/* Notifikaciona ikona */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: hasNewNotification ? 'red' : '#16a34a',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={toggleNotifications}
        title="Show Notifications"
      >
        🔔
      </div>

      {/* Lista obaveštenja */}
      {isVisible && (
        <>
          {/* Pozadinski sloj za zatvaranje prozora */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              zIndex: 998,
            }}
            onClick={closeNotifications}
          ></div>

          <div
            style={{
              position: 'fixed',
              bottom: '80px',
              left: '20px',
              width: '300px',
              maxHeight: '400px',
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              zIndex: 999,
              padding: '10px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
              Notifications
            </div>
            
            {/* Dugmadi za brisanje */}
            <div style={{ marginBottom: '10px' }}>
              <button
                onClick={deleteSelectedNotifications}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  transition: 'background-color 0.3s',
                }}
              >
                Delete Selected
              </button>
              <button
                onClick={deleteAllNotifications}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
              >
                Delete All
              </button>
            </div>

            {/* Prikaz obaveštenja */}
            {notifications.length > 0 ? (
              notifications.map((n, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer',
                    backgroundColor: selectedNotifications.has(index) ? '#f0f0f0' : 'white',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => n.event && handleNotificationClick(n.event.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(index)}
                    onChange={() => toggleNotificationSelection(index)}
                    style={{ marginRight: '10px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div>{n.message}</div>
                    {n.event && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Event: {n.event.title}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '10px', color: '#888' }}>No notifications</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
