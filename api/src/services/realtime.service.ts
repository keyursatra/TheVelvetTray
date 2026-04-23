import { Server as IOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../config/logger';

export type RealtimeEvent =
  | 'order:new'
  | 'order:update'
  | 'order:status'
  | 'enquiry:new'
  | 'enquiry:update'
  | 'stock:low'
  | 'stock:out'
  | 'hamper:update';

let io: IOServer | null = null;

export function initRealtime(server: HttpServer): IOServer {
  io = new IOServer(server, {
    cors: {
      origin: [env.WEB_ORIGIN, env.ADMIN_ORIGIN],
      credentials: true,
    },
    path: '/rt',
  });

  const admin = io.of('/admin');

  admin.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authorization as string | undefined)?.replace('Bearer ', '');
      if (!token) return next(new Error('Missing token'));
      const payload = verifyAccessToken(token);
      if (payload.role !== 'admin' && payload.role !== 'superadmin') {
        return next(new Error('Forbidden'));
      }
      socket.data.user = payload;
      next();
    } catch (err) {
      next(err as Error);
    }
  });

  admin.on('connection', (socket) => {
    logger.debug({ id: socket.id, user: socket.data.user?.email }, 'Admin socket connected');
    socket.join('admins');
    socket.emit('connected', { at: new Date().toISOString() });

    socket.on('disconnect', () => {
      logger.debug({ id: socket.id }, 'Admin socket disconnected');
    });
  });

  logger.info('Realtime (Socket.io) initialised at /rt');
  return io;
}

export function emitAdmin(event: RealtimeEvent, payload: unknown): void {
  if (!io) return;
  io.of('/admin').to('admins').emit(event, { event, payload, at: new Date().toISOString() });
}

export function getIO(): IOServer | null {
  return io;
}
