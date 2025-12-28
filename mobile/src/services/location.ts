import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  timestamp: number;
}

export type LocationCallback = (location: LocationData) => void;

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private listeners: LocationCallback[] = [];
  private lastLocation: LocationData | null = null;
  private isTracking: boolean = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.warn('[Location] Foreground permission denied');
        return false;
      }

      // For background tracking (optional, for when app is in background)
      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('[Location] Background permission denied (optional)');
        }
      }

      return true;
    } catch (error) {
      console.error('[Location] Error requesting permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      this.lastLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('[Location] Error getting current location:', error);
      return null;
    }
  }

  async startTracking(intervalMs: number = 3000): Promise<boolean> {
    if (this.isTracking) {
      console.log('[Location] Already tracking');
      return true;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;

      // Enable location services check
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.error('[Location] Location services are disabled');
        return false;
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: intervalMs,
          distanceInterval: 5, // Minimum 5 meters movement
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: location.coords.speed,
            heading: location.coords.heading,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };

          this.lastLocation = locationData;
          this.notifyListeners(locationData);
        }
      );

      this.isTracking = true;
      console.log('[Location] Tracking started');
      return true;
    } catch (error) {
      console.error('[Location] Error starting tracking:', error);
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.isTracking = false;
    console.log('[Location] Tracking stopped');
  }

  private notifyListeners(location: LocationData): void {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('[Location] Error in listener callback:', error);
      }
    });
  }

  addListener(callback: LocationCallback): () => void {
    this.listeners.push(callback);
    
    // Immediately send last known location if available
    if (this.lastLocation) {
      callback(this.lastLocation);
    }

    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  getLastLocation(): LocationData | null {
    return this.lastLocation;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
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

  // Estimate time to reach a point based on current speed
  estimateTimeToReach(
    currentLat: number,
    currentLng: number,
    targetLat: number,
    targetLng: number,
    speedMps: number | null
  ): number | null {
    if (!speedMps || speedMps <= 0) return null;
    
    const distance = this.calculateDistance(currentLat, currentLng, targetLat, targetLng);
    return Math.round(distance / speedMps); // Time in seconds
  }
}

// Singleton instance
export const locationService = new LocationService();
