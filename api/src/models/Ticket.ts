import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  ticketNumber: string;
  qrCode: string;
  qrData: string;
  name: string;
  category: 'single' | 'multi' | 'time_based';
  color: string;
  priceUSD: number;
  maxUses: number;
  remainingUses: number;
  durationMinutes?: number;
  expiresAt?: Date;
  activatedAt?: Date;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  timeRemaining: number | null;
  purchasedAt: Date;
  // Redemption tracking
  usedInTrips: Array<{
    tripId: mongoose.Types.ObjectId;
    usedAt: Date;
    driverId: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketType extends Document {
  name: string;
  description: string;
  category: 'single' | 'multi' | 'time_based';
  color: string;
  priceUSD: number;
  maxUses: number;
  durationMinutes?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TicketUsageSchema = new Schema({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  usedAt: { type: Date, default: Date.now },
  driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const TicketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticketNumber: { type: String, required: true, unique: true },
    qrCode: { type: String, required: true },
    qrData: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['single', 'multi', 'time_based'],
      required: true,
    },
    color: { type: String, default: '#1976D2' },
    priceUSD: { type: Number, required: true },
    maxUses: { type: Number, required: true },
    remainingUses: { type: Number, required: true },
    durationMinutes: { type: Number },
    expiresAt: { type: Date },
    activatedAt: { type: Date },
    status: {
      type: String,
      enum: ['active', 'used', 'expired', 'cancelled'],
      default: 'active',
    },
    purchasedAt: { type: Date, default: Date.now },
    usedInTrips: [TicketUsageSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for time remaining (for time-based tickets)
TicketSchema.virtual('timeRemaining').get(function (this: ITicket) {
  if (this.category !== 'time_based' || !this.activatedAt || !this.durationMinutes) {
    return null;
  }
  const expiresAt = new Date(this.activatedAt.getTime() + this.durationMinutes * 60 * 1000);
  const remaining = expiresAt.getTime() - Date.now();
  return remaining > 0 ? Math.floor(remaining / 1000) : 0;
});

// Generate unique ticket number
TicketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const prefix = this.category === 'single' ? 'SGL' : this.category === 'multi' ? 'MLT' : 'TMB';
    this.ticketNumber = `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }
  if (!this.qrData) {
    this.qrData = `SUBA-${this._id}-${crypto.randomBytes(8).toString('hex')}`;
  }
  if (!this.qrCode) {
    // QR code URL - could be a data URL or external service
    this.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.qrData)}`;
  }
  next();
});

// Indexes
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ qrData: 1 });
TicketSchema.index({ ticketNumber: 1 });

// Ticket Type Schema (for admin to configure ticket types)
const TicketTypeSchema = new Schema<ITicketType>(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['single', 'multi', 'time_based'],
      required: true,
    },
    color: { type: String, default: '#1976D2' },
    priceUSD: { type: Number, required: true },
    maxUses: { type: Number, required: true },
    durationMinutes: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
export const TicketType = mongoose.model<ITicketType>('TicketType', TicketTypeSchema);
