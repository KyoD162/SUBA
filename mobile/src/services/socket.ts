import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_PORT = 4000;

const getSocketUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    // Remove /api suffix if present for socket connection
    return envUrl.replace(/\/api$/, '');
  }

  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:${API_PORT}`;
    }
    return `http://localhost:${API_PORT}`;
  }

  return 'https://api.suba.com';
};

export interface BusLocation {
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

type BusLocationCallback = (bus: BusLocation) => void;
type BusRemovedCallback = (data: { tripId: string }) => void;
type BusesListCallback = (buses: BusLocation[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  
  // Listeners
  private busLocationListeners: BusLocationCallback[] = [];
  private busRemovedListeners: BusRemovedCallback[] = [];
  private allBusesListeners: BusesListCallback[] = [];
  private routeBusesListeners: Map<string, BusesListCallback[]> = new Map();

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const token = await AsyncStorage.getItem('auth_token');
    const socketUrl = getSocketUrl();
    
    console.log('[Socket] Connecting to:', socketUrl);

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.reconnectAttempts++;
    });

    // Bus location updates
    this.socket.on('bus:location:update', (data: BusLocation) => {
      this.busLocationListeners.forEach(cb => cb(data));
    });

    this.socket.on('buses:update', (data: BusLocation) => {
      this.busLocationListeners.forEach(cb => cb(data));
    });

    // Bus removed
    this.socket.on('bus:removed', (data: { tripId: string }) => {
      this.busRemovedListeners.forEach(cb => cb(data));
    });

    // All buses
    this.socket.on('buses:all', (data: { buses: BusLocation[] }) => {
      this.allBusesListeners.forEach(cb => cb(data.buses));
    });

    // Route specific buses
    this.socket.on('route:buses:current', (data: { routeId: string; buses: BusLocation[] }) => {
      const listeners = this.routeBusesListeners.get(data.routeId) || [];
      listeners.forEach(cb => cb(data.buses));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Driver: Send location update
  sendDriverLocation(data: {
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
  }): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot send location');
      return;
    }
    this.socket.emit('driver:location:update', data);
  }

  // Driver: End trip notification
  sendTripEnd(tripId: string, routeId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('driver:trip:end', { tripId, routeId });
  }

  // Rider: Subscribe to a route
  subscribeToRoute(routeId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot subscribe');
      return;
    }
    this.socket.emit('rider:subscribe:route', { routeId });
  }

  // Rider: Unsubscribe from a route
  unsubscribeFromRoute(routeId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('rider:unsubscribe:route', { routeId });
  }

  // Rider: Get all active buses
  requestAllBuses(): void {
    if (!this.socket?.connected) return;
    this.socket.emit('rider:get:all-buses');
  }

  // Event listeners
  onBusLocationUpdate(callback: BusLocationCallback): () => void {
    this.busLocationListeners.push(callback);
    return () => {
      this.busLocationListeners = this.busLocationListeners.filter(cb => cb !== callback);
    };
  }

  onBusRemoved(callback: BusRemovedCallback): () => void {
    this.busRemovedListeners.push(callback);
    return () => {
      this.busRemovedListeners = this.busRemovedListeners.filter(cb => cb !== callback);
    };
  }

  onAllBuses(callback: BusesListCallback): () => void {
    this.allBusesListeners.push(callback);
    return () => {
      this.allBusesListeners = this.allBusesListeners.filter(cb => cb !== callback);
    };
  }

  onRouteBuses(routeId: string, callback: BusesListCallback): () => void {
    const listeners = this.routeBusesListeners.get(routeId) || [];
    listeners.push(callback);
    this.routeBusesListeners.set(routeId, listeners);
    
    return () => {
      const current = this.routeBusesListeners.get(routeId) || [];
      this.routeBusesListeners.set(routeId, current.filter(cb => cb !== callback));
    };
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const socketService = new SocketService();
