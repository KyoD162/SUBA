import mongoose, { Schema } from 'mongoose';
import { User, IUser } from './User';

export interface IDriver extends IUser {
  licenseNumber: string;
  vehiclePlate: string;
  vehicleModel?: string;
  isAvailable: boolean;
  rating: number;
}

const DriverSchema = new Schema<IDriver>({
  licenseNumber: { type: String, required: true },
  vehiclePlate: { type: String, required: true },
  vehicleModel: { type: String },
  isAvailable: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0 }
});

export const Driver = User.discriminator<IDriver>('driver', DriverSchema);
