import type { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export function initSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    const token = socket.handshake.auth?.token as string | undefined;
    let userId: string | undefined;
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || '';
        const payload = jwt.verify(token, secret) as { userId: string };
        userId = payload.userId;
      } catch {
        // ignore
      }
    }

    socket.on('location:update', (data: { lat: number; lng: number }) => {
      io.emit('location:broadcast', { userId, ...data, ts: Date.now() });
    });

    socket.on('disconnect', () => {
      // noop for now
    });
  });
}
