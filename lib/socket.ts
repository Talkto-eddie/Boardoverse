"use client";

import { io } from "socket.io-client";

const SOCKET_URL = 'https://boardoverse-backend.onrender.com';

console.log('Initializing socket connection to:', SOCKET_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000, 
  forceNew: true,
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully:', socket.id);
  console.log('Socket transport:', socket.io.engine.transport.name);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    console.log('Server initiated disconnect, attempting to reconnect...');
    socket.connect();
  }
});

socket.on('connect_error', (error) => {
  console.error('🔥 Socket connection error:', error);
  console.error('Error details:', {
    message: error.message,
    name: error.name,
    stack: error.stack
  });
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Socket reconnection attempt:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('🔥 Socket reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('🔥 Socket reconnection failed after all attempts');
});