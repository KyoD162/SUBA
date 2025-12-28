import mongoose, { Schema, Document } from 'mongoose';

export interface ITripStop {
  stopId: string;
  name: string;
  lat: number;
  lng: number;
  arrivedAt?: Date;
  passengersLoaded: number;
  passengersUnloaded: number;
}

export interface ILocationLog {
  lat: number;
  lng: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

export interface ITrip extends Document {
  driverId: mongoose.Types.ObjectId;
  routeId: string;
  routeName: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  currentLat: number;
  currentLng: number;
  currentStopIndex: number;
  nextStopId: string;
  stops: ITripStop[];
  locationHistory: ILocationLog[];
  totalPassengersLoaded: number;
  totalPassengersUnloaded: number;
  currentOccupancy: number;
  maxCapacity: number;
  distanceTraveled: number; // in meters
  averageSpeed?: number; // km/h
  createdAt: Date;
  updatedAt: Date;
}

const TripStopSchema = new Schema<ITripStop>({
  stopId: { type: String, required: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  arrivedAt: { type: Date },
  passengersLoaded: { type: Number, default: 0 },
  passengersUnloaded: { type: Number, default: 0 },
});

const LocationLogSchema = new Schema<ILocationLog>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  speed: { type: Number },
  heading: { type: Number },
});

const TripSchema = new Schema<ITrip>(
  {
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'cancelled'],
      default: 'active',
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    duration: { type: Number },
    currentLat: { type: Number, required: true },
    currentLng: { type: Number, required: true },
    currentStopIndex: { type: Number, default: 0 },
    nextStopId: { type: String },
    stops: [TripStopSchema],
    locationHistory: [LocationLogSchema],
    totalPassengersLoaded: { type: Number, default: 0 },
    totalPassengersUnloaded: { type: Number, default: 0 },
    currentOccupancy: { type: Number, default: 0 },
    maxCapacity: { type: Number, default: 50 },
    distanceTraveled: { type: Number, default: 0 },
    averageSpeed: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Index for active trips by driver
TripSchema.index({ driverId: 1, status: 1 });
// Index for route tracking
TripSchema.index({ routeId: 1, status: 1 });

export const Trip = mongoose.model<ITrip>('Trip', TripSchema);
