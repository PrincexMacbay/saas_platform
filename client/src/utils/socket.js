import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  // Get API URL and remove /api if present for Socket.io connection
  let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Socket.io connects to the base server URL, not /api
  if (apiUrl.includes('/api')) {
    apiUrl = apiUrl.replace('/api', '');
  }

  socket = io(apiUrl, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Connected to Socket.io server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.io server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
