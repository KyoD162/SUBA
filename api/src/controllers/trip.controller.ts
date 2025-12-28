import { Request, Response, NextFunction } from 'express';

import { Trip } from '../models/Trip';
import { Route } from '../models/Route';

// Start a new trip
export async function startTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { routeId, startLat, startLng, maxCapacity = 50 } = req.body;

    if (!routeId || startLat === undefined || startLng === undefined) {
      res.status(400).json({ message: 'routeId, startLat, and startLng are required' });
      return;
    }

    // Check if driver already has an active trip
    const existingTrip = await Trip.findOne({ driverId: userId, status: 'active' });
    if (existingTrip) {
      res.status(400).json({ message: 'You already have an active trip', tripId: existingTrip._id });
      return;
    }

    // Get route info
    const route = await Route.findOne({ routeId });
    if (!route) {
      res.status(404).json({ message: 'Route not found' });
      return;
    }

    // Create trip with route stops
    const tripStops = route.stops.map(stop => ({
      stopId: stop.id,
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      passengersLoaded: 0,
      passengersUnloaded: 0,
    }));

    const trip = new Trip({
      driverId: userId,
      routeId: route.routeId,
      routeName: route.name,
      currentLat: startLat,
      currentLng: startLng,
      stops: tripStops,
      nextStopId: tripStops[0]?.stopId,
      maxCapacity,
      locationHistory: [{ lat: startLat, lng: startLng, timestamp: new Date() }],
    });

    await trip.save();

    res.status(201).json({
      message: 'Trip started successfully',
      trip: {
        id: trip._id,
        routeId: trip.routeId,
        routeName: trip.routeName,
        status: trip.status,
        startedAt: trip.startedAt,
        stops: trip.stops,
        currentStopIndex: trip.currentStopIndex,
        nextStopId: trip.nextStopId,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Update driver location
export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { tripId, lat, lng, speed, heading } = req.body;

    if (!tripId || lat === undefined || lng === undefined) {
      res.status(400).json({ message: 'tripId, lat, and lng are required' });
      return;
    }

    const trip = await Trip.findOne({ _id: tripId, driverId: userId, status: 'active' });
    if (!trip) {
      res.status(404).json({ message: 'Active trip not found' });
      return;
    }

    // Calculate distance from last location
    const lastLocation = trip.locationHistory[trip.locationHistory.length - 1];
    let additionalDistance = 0;
    if (lastLocation) {
      additionalDistance = calculateDistance(
        lastLocation.lat,
        lastLocation.lng,
        lat,
        lng
      );
    }

    // Update trip
    trip.currentLat = lat;
    trip.currentLng = lng;
    trip.distanceTraveled += additionalDistance;
    trip.locationHistory.push({
      lat,
      lng,
      timestamp: new Date(),
      speed,
      heading,
    });

    // Check if near next stop (within 50 meters)
    const nextStop = trip.stops[trip.currentStopIndex];
    if (nextStop) {
      const distanceToStop = calculateDistance(lat, lng, nextStop.lat, nextStop.lng);
      if (distanceToStop < 50) {
        // Mark stop as arrived
        trip.stops[trip.currentStopIndex].arrivedAt = new Date();
        trip.currentStopIndex++;
        
        if (trip.currentStopIndex < trip.stops.length) {
          trip.nextStopId = trip.stops[trip.currentStopIndex].stopId;
        } else {
          trip.nextStopId = '';
        }
      }
    }

    await trip.save();

    res.json({
      message: 'Location updated',
      currentStopIndex: trip.currentStopIndex,
      nextStopId: trip.nextStopId,
      distanceTraveled: trip.distanceTraveled,
      distanceToNextStop: nextStop 
        ? calculateDistance(lat, lng, nextStop.lat, nextStop.lng) 
        : null,
    });
  } catch (error) {
    next(error);
  }
}

// Load passengers at current stop
export async function loadPassengers(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { tripId, count, ticketCodes } = req.body;

    if (!tripId || !count) {
      res.status(400).json({ message: 'tripId and count are required' });
      return;
    }

    const trip = await Trip.findOne({ _id: tripId, driverId: userId, status: 'active' });
    if (!trip) {
      res.status(404).json({ message: 'Active trip not found' });
      return;
    }

    if (trip.currentOccupancy + count > trip.maxCapacity) {
      res.status(400).json({ 
        message: 'Exceeds max capacity',
        currentOccupancy: trip.currentOccupancy,
        maxCapacity: trip.maxCapacity,
      });
      return;
    }

    // Update stop stats
    const currentStopIdx = Math.max(0, trip.currentStopIndex - 1);
    if (trip.stops[currentStopIdx]) {
      trip.stops[currentStopIdx].passengersLoaded += count;
    }

    trip.currentOccupancy += count;
    trip.totalPassengersLoaded += count;

    await trip.save();

    res.json({
      message: 'Passengers loaded',
      currentOccupancy: trip.currentOccupancy,
      totalPassengersLoaded: trip.totalPassengersLoaded,
      ticketCodes: ticketCodes || [],
    });
  } catch (error) {
    next(error);
  }
}

// Unload passengers
export async function unloadPassengers(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { tripId, count } = req.body;

    if (!tripId || !count) {
      res.status(400).json({ message: 'tripId and count are required' });
      return;
    }

    const trip = await Trip.findOne({ _id: tripId, driverId: userId, status: 'active' });
    if (!trip) {
      res.status(404).json({ message: 'Active trip not found' });
      return;
    }

    const actualUnload = Math.min(count, trip.currentOccupancy);
    
    // Update stop stats
    const currentStopIdx = Math.max(0, trip.currentStopIndex - 1);
    if (trip.stops[currentStopIdx]) {
      trip.stops[currentStopIdx].passengersUnloaded += actualUnload;
    }

    trip.currentOccupancy -= actualUnload;
    trip.totalPassengersUnloaded += actualUnload;

    await trip.save();

    res.json({
      message: 'Passengers unloaded',
      unloaded: actualUnload,
      currentOccupancy: trip.currentOccupancy,
    });
  } catch (error) {
    next(error);
  }
}

// End trip
export async function endTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { tripId } = req.body;

    if (!tripId) {
      res.status(400).json({ message: 'tripId is required' });
      return;
    }

    const trip = await Trip.findOne({ _id: tripId, driverId: userId, status: 'active' });
    if (!trip) {
      res.status(404).json({ message: 'Active trip not found' });
      return;
    }

    trip.status = 'completed';
    trip.endedAt = new Date();
    trip.duration = Math.floor((trip.endedAt.getTime() - trip.startedAt.getTime()) / 1000);
    
    // Calculate average speed
    if (trip.duration > 0 && trip.distanceTraveled > 0) {
      trip.averageSpeed = (trip.distanceTraveled / 1000) / (trip.duration / 3600); // km/h
    }

    await trip.save();

    res.json({
      message: 'Trip completed',
      summary: {
        tripId: trip._id,
        routeName: trip.routeName,
        duration: trip.duration,
        durationFormatted: formatDuration(trip.duration),
        stopsCompleted: trip.currentStopIndex,
        totalStops: trip.stops.length,
        totalPassengersLoaded: trip.totalPassengersLoaded,
        totalPassengersUnloaded: trip.totalPassengersUnloaded,
        distanceTraveled: Math.round(trip.distanceTraveled),
        averageSpeed: trip.averageSpeed ? Math.round(trip.averageSpeed) : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get active trip for driver
export async function getActiveTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    const trip = await Trip.findOne({ driverId: userId, status: 'active' });
    
    if (!trip) {
      res.json({ hasActiveTrip: false });
      return;
    }

    const elapsed = Math.floor((Date.now() - trip.startedAt.getTime()) / 1000);

    res.json({
      hasActiveTrip: true,
      trip: {
        id: trip._id,
        routeId: trip.routeId,
        routeName: trip.routeName,
        status: trip.status,
        startedAt: trip.startedAt,
        elapsed,
        elapsedFormatted: formatDuration(elapsed),
        currentLat: trip.currentLat,
        currentLng: trip.currentLng,
        currentStopIndex: trip.currentStopIndex,
        nextStopId: trip.nextStopId,
        stops: trip.stops,
        currentOccupancy: trip.currentOccupancy,
        maxCapacity: trip.maxCapacity,
        totalPassengersLoaded: trip.totalPassengersLoaded,
        distanceTraveled: trip.distanceTraveled,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get trip history for driver
export async function getTripHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const trips = await Trip.find({ driverId: userId, status: 'completed' })
      .sort({ endedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('routeName startedAt endedAt duration totalPassengersLoaded distanceTraveled');

    const total = await Trip.countDocuments({ driverId: userId, status: 'completed' });

    res.json({
      trips: trips.map(t => ({
        id: t._id,
        routeName: t.routeName,
        startedAt: t.startedAt,
        endedAt: t.endedAt,
        durationFormatted: t.duration ? formatDuration(t.duration) : null,
        totalPassengersLoaded: t.totalPassengersLoaded,
        distanceTraveled: Math.round(t.distanceTraveled || 0),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get active buses on a route (for riders)
export async function getActiveBusesOnRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const { routeId } = req.params;

    const trips = await Trip.find({ routeId, status: 'active' })
      .select('driverId currentLat currentLng currentStopIndex nextStopId currentOccupancy maxCapacity stops');

    const buses = trips.map(trip => {
      const nextStop = trip.stops.find(s => s.stopId === trip.nextStopId);
      return {
        tripId: trip._id,
        lat: trip.currentLat,
        lng: trip.currentLng,
        occupancy: trip.currentOccupancy,
        maxCapacity: trip.maxCapacity,
        occupancyPercent: Math.round((trip.currentOccupancy / trip.maxCapacity) * 100),
        nextStop: nextStop ? {
          id: nextStop.stopId,
          name: nextStop.name,
          lat: nextStop.lat,
          lng: nextStop.lng,
        } : null,
        currentStopIndex: trip.currentStopIndex,
        totalStops: trip.stops.length,
      };
    });

    res.json({ buses });
  } catch (error) {
    next(error);
  }
}

// Utility: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Utility: Format duration in seconds to HH:MM:SS
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
