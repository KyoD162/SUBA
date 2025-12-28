import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { socketService, BusLocation } from '../services/socket';
import { locationService, LocationData } from '../services/location';
import * as TripAPI from '../services/trip';
import { useAuth } from './AuthContext';

export interface TripStop {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
  arrivedAt?: string;
  passengersLoaded: number;
  passengersUnloaded: number;
}

export interface ActiveTrip {
  id: string;
  routeId: string;
  routeName: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startedAt: Date;
  currentLat: number;
  currentLng: number;
  currentStopIndex: number;
  nextStopId: string;
  stops: TripStop[];
  currentOccupancy: number;
  maxCapacity: number;
  totalPassengersLoaded: number;
  distanceTraveled: number;
}

export interface TripSummary {
  tripId: string;
  routeName: string;
  duration: number;
  durationFormatted: string;
  stopsCompleted: number;
  totalStops: number;
  totalPassengersLoaded: number;
  totalPassengersUnloaded: number;
  distanceTraveled: number;
  averageSpeed: number | null;
}

interface TripContextValue {
  // State
  activeTrip: ActiveTrip | null;
  isLoading: boolean;
  error: string | null;
  elapsedTime: number;
  currentLocation: LocationData | null;
  isTracking: boolean;
  distanceToNextStop: number | null;
  
  // Actions
  startTrip: (routeId: string) => Promise<boolean>;
  endTrip: () => Promise<TripSummary | null>;
  loadPassengers: (count: number, ticketCodes?: string[]) => Promise<boolean>;
  unloadPassengers: (count: number) => Promise<boolean>;
  refreshActiveTrip: () => Promise<void>;
  
  // For riders
  activeBuses: Map<string, BusLocation>;
  subscribeToRoute: (routeId: string) => void;
  unsubscribeFromRoute: (routeId: string) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role, token } = useAuth();
  
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [distanceToNextStop, setDistanceToNextStop] = useState<number | null>(null);
  const [activeBuses, setActiveBuses] = useState<Map<string, BusLocation>>(new Map());
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Connect socket when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect();
    }
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  // Setup bus location listeners for riders
  useEffect(() => {
    const unsubLocation = socketService.onBusLocationUpdate((bus) => {
      setActiveBuses(prev => {
        const newMap = new Map(prev);
        newMap.set(bus.tripId, bus);
        return newMap;
      });
    });

    const unsubRemoved = socketService.onBusRemoved(({ tripId }) => {
      setActiveBuses(prev => {
        const newMap = new Map(prev);
        newMap.delete(tripId);
        return newMap;
      });
    });

    return () => {
      unsubLocation();
      unsubRemoved();
    };
  }, []);

  // Elapsed time timer
  useEffect(() => {
    if (activeTrip?.status === 'active') {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(activeTrip.startedAt).getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTrip?.status, activeTrip?.startedAt]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - refresh trip data
        if (activeTrip) {
          refreshActiveTrip();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [activeTrip]);

  // Location tracking for drivers
  useEffect(() => {
    if (role !== 'driver' || !activeTrip || activeTrip.status !== 'active') {
      if (isTracking) {
        locationService.stopTracking();
        setIsTracking(false);
      }
      return;
    }

    const startLocationTracking = async () => {
      const started = await locationService.startTracking(3000);
      setIsTracking(started);
    };

    startLocationTracking();

    const removeListener = locationService.addListener((location) => {
      setCurrentLocation(location);
      
      if (activeTrip) {
        // Calculate distance to next stop
        const nextStop = activeTrip.stops.find(s => s.stopId === activeTrip.nextStopId);
        if (nextStop) {
          const distance = locationService.calculateDistance(
            location.latitude,
            location.longitude,
            nextStop.lat,
            nextStop.lng
          );
          setDistanceToNextStop(Math.round(distance));
        }

        // Send location via socket
        socketService.sendDriverLocation({
          tripId: activeTrip.id,
          routeId: activeTrip.routeId,
          lat: location.latitude,
          lng: location.longitude,
          speed: location.speed || undefined,
          heading: location.heading || undefined,
          currentStopIndex: activeTrip.currentStopIndex,
          nextStopId: activeTrip.nextStopId,
          nextStopName: nextStop?.name || '',
          occupancy: activeTrip.currentOccupancy,
          maxCapacity: activeTrip.maxCapacity,
        });

        // Update API with location
        TripAPI.updateTripLocation(
          activeTrip.id,
          location.latitude,
          location.longitude,
          location.speed || undefined,
          location.heading || undefined
        ).then((result) => {
          // Update local state with server response
          if (result.currentStopIndex !== activeTrip.currentStopIndex) {
            setActiveTrip(prev => prev ? {
              ...prev,
              currentStopIndex: result.currentStopIndex,
              nextStopId: result.nextStopId,
              distanceTraveled: result.distanceTraveled,
            } : null);
          }
        }).catch(console.error);
      }
    });

    return () => {
      removeListener();
      locationService.stopTracking();
      setIsTracking(false);
    };
  }, [role, activeTrip?.id, activeTrip?.status]);

  // Check for existing active trip on mount
  useEffect(() => {
    if (isAuthenticated && role === 'driver') {
      refreshActiveTrip();
    }
  }, [isAuthenticated, role]);

  const refreshActiveTrip = useCallback(async () => {
    try {
      const result = await TripAPI.getActiveTrip();
      if (result.hasActiveTrip && result.trip) {
        setActiveTrip({
          id: result.trip.id,
          routeId: result.trip.routeId,
          routeName: result.trip.routeName,
          status: result.trip.status,
          startedAt: new Date(result.trip.startedAt),
          currentLat: result.trip.currentLat,
          currentLng: result.trip.currentLng,
          currentStopIndex: result.trip.currentStopIndex,
          nextStopId: result.trip.nextStopId,
          stops: result.trip.stops,
          currentOccupancy: result.trip.currentOccupancy,
          maxCapacity: result.trip.maxCapacity,
          totalPassengersLoaded: result.trip.totalPassengersLoaded,
          distanceTraveled: result.trip.distanceTraveled,
        });
      } else {
        setActiveTrip(null);
      }
    } catch (err) {
      console.error('[TripContext] Error refreshing active trip:', err);
    }
  }, []);

  const startTrip = useCallback(async (routeId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current location first
      const location = await locationService.getCurrentLocation();
      if (!location) {
        setError('No se pudo obtener la ubicación actual');
        setIsLoading(false);
        return false;
      }

      const result = await TripAPI.startTrip(
        routeId,
        location.latitude,
        location.longitude,
        50
      );

      setActiveTrip({
        id: result.tripId,
        routeId: result.trip.routeId,
        routeName: result.trip.routeName,
        status: 'active',
        startedAt: new Date(result.trip.startedAt),
        currentLat: location.latitude,
        currentLng: location.longitude,
        currentStopIndex: result.trip.currentStopIndex,
        nextStopId: result.trip.nextStopId,
        stops: result.trip.stops,
        currentOccupancy: 0,
        maxCapacity: 50,
        totalPassengersLoaded: 0,
        distanceTraveled: 0,
      });

      setCurrentLocation(location);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar el viaje');
      setIsLoading(false);
      return false;
    }
  }, []);

  const endTrip = useCallback(async (): Promise<TripSummary | null> => {
    if (!activeTrip) return null;

    setIsLoading(true);
    setError(null);

    try {
      const summary = await TripAPI.endTrip(activeTrip.id);
      
      // Notify via socket
      socketService.sendTripEnd(activeTrip.id, activeTrip.routeId);
      
      // Stop location tracking
      locationService.stopTracking();
      setIsTracking(false);
      
      setActiveTrip(null);
      setCurrentLocation(null);
      setDistanceToNextStop(null);
      setIsLoading(false);

      return summary;
    } catch (err: any) {
      setError(err.message || 'Error al finalizar el viaje');
      setIsLoading(false);
      return null;
    }
  }, [activeTrip]);

  const loadPassengers = useCallback(async (count: number, ticketCodes?: string[]): Promise<boolean> => {
    if (!activeTrip) return false;

    try {
      const result = await TripAPI.loadPassengers(activeTrip.id, count, ticketCodes);
      
      setActiveTrip(prev => prev ? {
        ...prev,
        currentOccupancy: result.currentOccupancy,
        totalPassengersLoaded: result.totalPassengersLoaded,
      } : null);

      return true;
    } catch (err: any) {
      setError(err.message || 'Error al cargar pasajeros');
      return false;
    }
  }, [activeTrip]);

  const unloadPassengers = useCallback(async (count: number): Promise<boolean> => {
    if (!activeTrip) return false;

    try {
      const result = await TripAPI.unloadPassengers(activeTrip.id, count);
      
      setActiveTrip(prev => prev ? {
        ...prev,
        currentOccupancy: result.currentOccupancy,
      } : null);

      return true;
    } catch (err: any) {
      setError(err.message || 'Error al descargar pasajeros');
      return false;
    }
  }, [activeTrip]);

  const subscribeToRoute = useCallback((routeId: string) => {
    socketService.subscribeToRoute(routeId);
  }, []);

  const unsubscribeFromRoute = useCallback((routeId: string) => {
    socketService.unsubscribeFromRoute(routeId);
  }, []);

  return (
    <TripContext.Provider
      value={{
        activeTrip,
        isLoading,
        error,
        elapsedTime,
        currentLocation,
        isTracking,
        distanceToNextStop,
        startTrip,
        endTrip,
        loadPassengers,
        unloadPassengers,
        refreshActiveTrip,
        activeBuses,
        subscribeToRoute,
        unsubscribeFromRoute,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}

// Helper to format elapsed time
export function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Helper to format distance
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
