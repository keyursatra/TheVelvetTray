'use client';
import { io, type Socket } from 'socket.io-client';
import { getToken } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  const base = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:4000';
  socket = io(`${base}/admin`, {
    path: '/rt',
    withCredentials: true,
    transports: ['websocket'],
    auth: { token: getToken() },
    reconnection: true,
    reconnectionDelay: 1500,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
