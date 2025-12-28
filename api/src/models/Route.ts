import mongoose, { Schema, Document } from 'mongoose';

export interface IRouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface IRoute extends Document {
  routeId: string;
  name: string;
  description?: string;
  color: string;
  stops: IRouteStop[];
  isActive: boolean;
  priceUSD: number;
  frequency: string;
  estimatedDuration: number; // in minutes
  distance: number; // in km
  createdAt: Date;
  updatedAt: Date;
}

const RouteStopSchema = new Schema<IRouteStop>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  order: { type: Number, required: true },
});

const RouteSchema = new Schema<IRoute>(
  {
    routeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#1976D2' },
    stops: [RouteStopSchema],
    isActive: { type: Boolean, default: true },
    priceUSD: { type: Number, default: 0.5 },
    frequency: { type: String, default: '10-15 min' },
    estimatedDuration: { type: Number, default: 30 },
    distance: { type: Number, default: 5 },
  },
  {
    timestamps: true,
  }
);

RouteSchema.index({ routeId: 1 });
RouteSchema.index({ isActive: 1 });

export const Route = mongoose.model<IRoute>('Route', RouteSchema);
