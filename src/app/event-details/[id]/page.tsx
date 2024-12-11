'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getEventById, updateEvent, cancelEvent, isUsersEvent } from '@/lib/event'; 
import { getUserById, getAllUsers } from '@/lib/user';
import { sendInvitation } from '@/lib/invitation';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getAuthToken } from '@/utilis/authHelpers';
import { EventData } from '@/types/event';
import { UserData } from '@/types/user';
import { EVENT_TYPES } from '@/constants/eventTypes';
import withAuthGuard from '@/guard/authGuard';
import socket, { connectSocket, disconnectSocket } from '@/lib/socket';

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
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams(); 
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get('invitationAccepted') === 'true') {
      setModalVisible(true);
    }
  }, [searchParams]);
  
  const closeModal = () => setModalVisible(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.surname.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  useEffect(() => {
    connectSocket();
  
    socket.on('updatedEvent', (updatedEvent: EventData) => {
      setEvent(updatedEvent)
    });
  
    return () => {
      socket.off('updated');
      disconnectSocket();
    };
  }, []);

  const fetchEventData = async (eventId: string | string[]) => {
    try {
      const eventData = await getEventById(+eventId);
      if (!eventData) {
        throw new Error("Event not found");
      }
      setEvent(eventData);
      setUpdatedEvent(eventData);
  
      if (!eventData.creator_id) {
        setError("Undefined event creator ID.");
        return;
      }

      const userData = await getUserById(eventData.creator_id);
      if (!userData) {
        throw new Error("User not found");
      }
      setUser(userData);
      setIsCreator(await isUsersEvent(+eventId));
      setUsers(await getAllUsers())
    } catch (err: any) {
      setError(err.message || "Failed to load event data.");
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

      handleSuccess(updatedEvent);
    } catch (error: any) {
      alert(`Failed to update event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSuccess = (updatedEvent: EventData) => {
    setEvent(updatedEvent);
    setIsUpdateModalOpen(false);
    alert('Event updated successfully!');
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

  const handleCancelClick = () => {
    setIsCancelModalOpen(true); 
  };

  const handleConfirmCancel = async () => {
    try {
      if (!event) {
        alert("Event is not defined.");
        return;
      }
  
      if (!event.id) {
        alert("Event ID is missing.");
        return;
      }
  
      const response = await cancelEvent(event.id);
      if (!response) {
        throw new Error("Cancelation API returned no response.");
      }
  
      handleCancelSuccess();
    } catch (error: any) {
      alert(`Failed to cancel the event: ${error.message || 'Unknown error'}`);
      setIsCancelModalOpen(false); 
    }
  };  

  const handleCancelSuccess = () => {
    alert("Event successfully canceled!");
    setIsCancelModalOpen(false);
    router.push(`/events-overview`);
  }

  const handleCloseModal = () => {
    setIsCancelModalOpen(false); 
  };
  
  const handleSendInvitations = async () => {
    try {
      if (!event) {
        alert("Event is not defined.");
        return;
      }
  
      if (!event.id) {
        alert("Event ID is missing.");
        return;
      }

      await Promise.all(selectedUsers.map((userId) => sendInvitation({ user_id: userId, event_id: event?.id, status: 'pending' })));
      alert('Invitations sent successfully!');
      setIsInvitationModalOpen(false);
    } catch (err) {
      alert('Failed to send invitations.');
    }
  };

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
    <div className="bg-light-green min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
      {/* Event Title and Description */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">🎉</span>{event.title}
      </h1>

      {/* Event Details */}
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-800 mr-2">📜 Description:</span>
          <span className="text-gray-600">{event.description}</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-800 mr-2">📍 Location:</span>
          <span className="text-gray-600">{event.location}</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-800 mr-2">🔖 Type:</span>
          <span className="text-gray-600">{event.type}</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-800 mr-2">📅 Date:</span>
          <span className="text-gray-600">{formatDate(event.date_time.toString())}</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-800 mr-2">⚡ Status:</span>
          <span className={`text-gray-600 ${event.active ? 'text-green-600' : 'text-red-600'}`}>
            {event.active ? 'Active' : 'Canceled'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-gray-200"></div>

      {/* User Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Created By:</h2>
        <p className="text-lg text-gray-600">👤 Name: {user.name} {user.surname}</p>
        <p className="text-lg text-gray-600">📧 Email: {user.email}</p>
      </div>

      {/* Buttons */}
      {/* Buttons */}
      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleUpdateClick}
          disabled={!isCreator}
          className={`px-4 py-2 rounded flex items-center ${
            isCreator ? 'bg-green-600 text-white hover:bg-green-400' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <span className="mr-2">✏️</span> Update Event
        </button>

        <button
          onClick={handleCancelClick}
          disabled={!isCreator}
          className={`px-4 py-2 rounded flex items-center ${
            (isCreator && event.active) ? 'bg-red-600 text-white hover:bg-red-400' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <span className="mr-2">❌</span> Cancel Event
        </button>

        <button
          onClick={() => setIsInvitationModalOpen(true)}
          disabled={!isCreator || !event.active}
          className={`px-4 py-2 rounded flex items-center ${
            (isCreator && event.active) ? 'bg-blue-600 text-white hover:bg-blue-400' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <span className="mr-2">📩</span> Send Invitations
        </button>
      </div>

      {isUpdateModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md w-1/2">
              <h2 className="text-xl font-bold mb-4">Update Event</h2>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-1">📝 Title</label>
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
                  <label className="block text-sm font-medium mb-1">📝 Description</label>
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
                  <label className="block text-sm font-medium mb-1">📍 Location</label>
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
                  <label className="block text-sm font-medium mb-1">🔖 Type</label>
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
                  <label className="block text-sm font-medium mb-1">📅 Date & Time</label>
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

        {isCancelModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg text-center">
              <p className="mb-4">Are you sure you want to cancel this event?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-400"
                >
                  Yes
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-200"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {isInvitationModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Send Invitations</h2>

                {/* Search input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                  />
                </div>

                {/* User list */}
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers((prev) => [...prev, user.id]);
                            } else {
                              setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
                            }
                          }}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <label htmlFor={`user-${user.id}`} className="text-gray-700">
                          {user.name} {user.surname}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No users found.</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsInvitationModalOpen(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 focus:outline-none focus:ring focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvitations}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalVisible && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full text-center">
                <p className="text-xl font-semibold">Invitation Successfully Accepted!</p>
                <button 
                  onClick={closeModal}
                  className="mt-4 bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default withAuthGuard(EventDetails);
