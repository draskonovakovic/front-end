import { io, Socket } from 'socket.io-client';

const token = localStorage.getItem('authToken'); 

export const socket: Socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000', {
  autoConnect: false,
  extraHeaders: {
    Authorization: `Bearer ${token}`, 
  },
});

socket.on('connect', () => {
  console.log('WebSocket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('WebSocket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error.message);
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
