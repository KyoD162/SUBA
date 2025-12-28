import type { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface DriverLocation {
  tripId: string;
  driverId: string;
  routeId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  currentStopIndex: number;
  nextStopId: string;
  nextStopName: string;
  occupancy: number;
  maxCapacity: number;
  timestamp: number;
}

// Store active driver locations in memory for quick access
const activeDrivers = new Map<string, DriverLocation>();

export function initSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    const token = socket.handshake.auth?.token as string | undefined;
    let userId: string | undefined;
    let userRole: string | undefined;

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || '';
        const payload = jwt.verify(token, secret) as { userId: string; role?: string };
        userId = payload.userId;
        userRole = payload.role;
      } catch {
        // ignore invalid tokens
      }
    }

    // Driver sends location updates
    socket.on('driver:location:update', (data: {
      tripId: string;
      routeId: string;
      lat: number;
      lng: number;
      speed?: number;
      heading?: number;
      currentStopIndex: number;
      nextStopId: string;
      nextStopName: string;
      occupancy: number;
      maxCapacity: number;
    }) => {
      if (!userId) return;

      const locationData: DriverLocation = {
        ...data,
        driverId: userId,
        timestamp: Date.now(),
      };

      // Store in memory
      activeDrivers.set(data.tripId, locationData);

      // Join route room
      socket.join(`route:${data.routeId}`);

      // Broadcast to riders watching this route
      io.to(`route:${data.routeId}`).emit('bus:location:update', locationData);

      // Also broadcast to general bus tracking channel
      io.emit('buses:update', {
        tripId: data.tripId,
        routeId: data.routeId,
        lat: data.lat,
        lng: data.lng,
        occupancy: data.occupancy,
        maxCapacity: data.maxCapacity,
        nextStopName: data.nextStopName,
        timestamp: Date.now(),
      });
    });

    // Driver ends trip
    socket.on('driver:trip:end', (data: { tripId: string; routeId: string }) => {
      activeDrivers.delete(data.tripId);
      io.to(`route:${data.routeId}`).emit('bus:removed', { tripId: data.tripId });
      socket.leave(`route:${data.routeId}`);
    });

    // Rider subscribes to a route
    socket.on('rider:subscribe:route', (data: { routeId: string }) => {
      socket.join(`route:${data.routeId}`);
      
      // Send current buses on this route
      const buses: DriverLocation[] = [];
      activeDrivers.forEach((loc) => {
        if (loc.routeId === data.routeId) {
          buses.push(loc);
        }
      });
      socket.emit('route:buses:current', { routeId: data.routeId, buses });
    });

    // Rider unsubscribes from route
    socket.on('rider:unsubscribe:route', (data: { routeId: string }) => {
      socket.leave(`route:${data.routeId}`);
    });

    // Get all active buses (for home screen map)
    socket.on('rider:get:all-buses', () => {
      const buses: DriverLocation[] = [];
      activeDrivers.forEach((loc) => {
        buses.push(loc);
      });
      socket.emit('buses:all', { buses });
    });

    // Legacy location update support
    socket.on('location:update', (data: { lat: number; lng: number }) => {
      io.emit('location:broadcast', { userId, ...data, ts: Date.now() });
    });

    socket.on('disconnect', () => {
      // Clean up if driver disconnects
      if (userId && userRole === 'driver') {
        activeDrivers.forEach((loc, tripId) => {
          if (loc.driverId === userId) {
            activeDrivers.delete(tripId);
            io.to(`route:${loc.routeId}`).emit('bus:removed', { tripId });
          }
        });
      }
    });
  });
}

// Export for use in other parts of the app
export function getActiveDrivers(): DriverLocation[] {
  return Array.from(activeDrivers.values());
}

export function getDriversOnRoute(routeId: string): DriverLocation[] {
  return Array.from(activeDrivers.values()).filter(d => d.routeId === routeId);
}
