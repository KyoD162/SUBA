import { Schema } from 'mongoose';

import { User, IUser } from './User';

export interface IRider extends IUser {
  paymentMethods: string[];
  loyaltyPoints: number;
  specialDiscount?: 'student' | 'disabled' | 'senior' | 'none';
}

const RiderSchema = new Schema<IRider>({
  paymentMethods: { type: [String], default: [] },
  loyaltyPoints: { type: Number, default: 0 },
  specialDiscount: { type: String, enum: ['student', 'disabled', 'senior', 'none'], default: 'none' }
});

export const Rider = User.discriminator<IRider>('rider', RiderSchema);
