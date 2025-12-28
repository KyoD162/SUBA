import { API_URL, apiFetch } from './api';

export interface TripStop {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
  arrivedAt?: string;
  passengersLoaded: number;
  passengersUnloaded: number;
}

export interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startedAt: string;
  endedAt?: string;
  elapsed?: number;
  elapsedFormatted?: string;
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

export interface RouteData {
  routeId: string;
  name: string;
  description?: string;
  color: string;
  stops: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    order: number;
  }>;
  isActive: boolean;
  priceUSD: number;
  frequency: string;
  estimatedDuration: number;
  distance: number;
}

export interface BusOnRoute {
  tripId: string;
  lat: number;
  lng: number;
  occupancy: number;
  maxCapacity: number;
  occupancyPercent: number;
  nextStop: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  } | null;
  currentStopIndex: number;
  totalStops: number;
}

// Trip API calls
export async function startTrip(
  routeId: string,
  startLat: number,
  startLng: number,
  maxCapacity: number = 50
): Promise<{ tripId: string; trip: Trip }> {
  const response = await apiFetch(`${API_URL}/trips/start`, {
    method: 'POST',
    body: JSON.stringify({ routeId, startLat, startLng, maxCapacity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to start trip');
  }

  const data = await response.json();
  return { tripId: data.trip.id, trip: data.trip };
}

export async function updateTripLocation(
  tripId: string,
  lat: number,
  lng: number,
  speed?: number,
  heading?: number
): Promise<{
  currentStopIndex: number;
  nextStopId: string;
  distanceTraveled: number;
  distanceToNextStop: number | null;
}> {
  const response = await apiFetch(`${API_URL}/trips/location`, {
    method: 'POST',
    body: JSON.stringify({ tripId, lat, lng, speed, heading }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update location');
  }

  return response.json();
}

export async function loadPassengers(
  tripId: string,
  count: number,
  ticketCodes?: string[]
): Promise<{
  currentOccupancy: number;
  totalPassengersLoaded: number;
}> {
  const response = await apiFetch(`${API_URL}/trips/load-passengers`, {
    method: 'POST',
    body: JSON.stringify({ tripId, count, ticketCodes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to load passengers');
  }

  return response.json();
}

export async function unloadPassengers(
  tripId: string,
  count: number
): Promise<{
  unloaded: number;
  currentOccupancy: number;
}> {
  const response = await apiFetch(`${API_URL}/trips/unload-passengers`, {
    method: 'POST',
    body: JSON.stringify({ tripId, count }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to unload passengers');
  }

  return response.json();
}

export async function endTrip(tripId: string): Promise<TripSummary> {
  const response = await apiFetch(`${API_URL}/trips/end`, {
    method: 'POST',
    body: JSON.stringify({ tripId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to end trip');
  }

  const data = await response.json();
  return data.summary;
}

export async function getActiveTrip(): Promise<{ hasActiveTrip: boolean; trip?: Trip }> {
  const response = await apiFetch(`${API_URL}/trips/active`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get active trip');
  }

  return response.json();
}

export async function getTripHistory(
  page: number = 1,
  limit: number = 10
): Promise<{
  trips: Array<{
    id: string;
    routeName: string;
    startedAt: string;
    endedAt: string;
    durationFormatted: string;
    totalPassengersLoaded: number;
    distanceTraveled: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const response = await apiFetch(`${API_URL}/trips/history?page=${page}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get trip history');
  }

  return response.json();
}

// Route API calls
export async function getRoutes(): Promise<RouteData[]> {
  const response = await apiFetch(`${API_URL}/routes`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get routes');
  }

  const data = await response.json();
  return data.routes;
}

export async function getRoute(routeId: string): Promise<RouteData> {
  const response = await apiFetch(`${API_URL}/routes/${routeId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get route');
  }

  const data = await response.json();
  return data.route;
}

export async function getBusesOnRoute(routeId: string): Promise<BusOnRoute[]> {
  const response = await apiFetch(`${API_URL}/trips/buses/${routeId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get buses');
  }

  const data = await response.json();
  return data.buses;
}

export async function seedRoutes(): Promise<void> {
  const response = await apiFetch(`${API_URL}/routes/seed`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to seed routes');
  }
}
