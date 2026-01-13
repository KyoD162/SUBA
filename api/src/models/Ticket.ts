import crypto from 'crypto';

import mongoose, { Schema, Document, Types } from 'mongoose';

export type TicketStatus = 'active' | 'used' | 'expired' | 'cancelled';

export interface ITicketUsage {
  usedAt: Date;
  tripId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface ITicket extends Document {
  ticketNumber: string;
  qrCode: string; // Unique QR code data
  userId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  
  // Ticket details (snapshot from TicketType at purchase time)
  name: string;
  category: 'single' | 'multi' | 'time_based';
  price: number;
  usageLimit: number | null;
  durationMinutes: number | null;
  color: string;
  icon: string;
  
  // Status tracking
  status: TicketStatus;
  usageCount: number;
  usageHistory: ITicketUsage[];
  
  // Time-based expiration
  expiresAt: Date | null;
  activatedAt: Date | null; // When the ticket was first used (for time-based tickets)
  
  // Purchase info
  purchasedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  generateQRData(): string;
  canBeUsed(): boolean;
  use(tripId?: Types.ObjectId, driverId?: Types.ObjectId, location?: { lat: number; lng: number }): Promise<boolean>;
  getRemainingUses(): number | 'unlimited';
  getTimeRemaining(): number | null; // Returns remaining time in minutes, null if not time-based
}

const TicketUsageSchema = new Schema<ITicketUsage>(
  {
    usedAt: { type: Date, required: true, default: Date.now },
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip' },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => {
        const year = new Date().getFullYear();
        const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
        return `TKT-${year}-${randomPart}`;
      }
    },
    qrCode: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex')
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    ticketTypeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'TicketType', 
      required: true 
    },
    
    // Snapshot fields
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['single', 'multi', 'time_based'], 
      required: true 
    },
    price: { type: Number, required: true },
    usageLimit: { type: Number, default: null },
    durationMinutes: { type: Number, default: null },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    
    // Status
    status: { 
      type: String, 
      enum: ['active', 'used', 'expired', 'cancelled'], 
      default: 'active' 
    },
    usageCount: { type: Number, default: 0 },
    usageHistory: [TicketUsageSchema],
    
    // Expiration
    expiresAt: { type: Date, default: null },
    activatedAt: { type: Date, default: null },
    
    // Purchase
    purchasedAt: { type: Date, default: Date.now }
  },
  { 
    timestamps: true 
  }
);

// Ticket number and qrCode are generated via default functions above

// Method to check if ticket can be used
TicketSchema.methods.canBeUsed = function(): boolean {
  // Check if already fully used or expired
  if (this.status !== 'active') {
    return false;
  }
  
  // Check usage limit for single/multi use tickets
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return false;
  }
  
  // Check time-based expiration
  if (this.expiresAt && new Date() > this.expiresAt) {
    return false;
  }
  
  return true;
};

// Method to use the ticket
TicketSchema.methods.use = async function(
  tripId?: Types.ObjectId, 
  driverId?: Types.ObjectId, 
  location?: { lat: number; lng: number }
): Promise<boolean> {
  if (!this.canBeUsed()) {
    return false;
  }
  
  const now = new Date();
  
  // For time-based tickets, set activation and expiration on first use
  if (this.category === 'time_based' && !this.activatedAt) {
    this.activatedAt = now;
    if (this.durationMinutes) {
      this.expiresAt = new Date(now.getTime() + this.durationMinutes * 60 * 1000);
    }
  }
  
  // Record usage
  this.usageCount += 1;
  this.usageHistory.push({
    usedAt: now,
    tripId,
    driverId,
    location
  });
  
  // Check if ticket is now fully used
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    this.status = 'used';
  }
  
  await this.save();
  return true;
};

// Get remaining uses
TicketSchema.methods.getRemainingUses = function(): number | 'unlimited' {
  if (this.usageLimit === null) {
    return 'unlimited';
  }
  return Math.max(0, this.usageLimit - this.usageCount);
};

// Get remaining time in minutes
TicketSchema.methods.getTimeRemaining = function(): number | null {
  if (this.category !== 'time_based' || !this.expiresAt) {
    return null;
  }
  
  const now = new Date();
  const remaining = Math.max(0, (this.expiresAt.getTime() - now.getTime()) / (1000 * 60));
  return Math.round(remaining);
};

// Static method to generate QR data
TicketSchema.methods.generateQRData = function(): string {
  return JSON.stringify({
    ticketId: this._id.toString(),
    ticketNumber: this.ticketNumber,
    qrCode: this.qrCode,
    userId: this.userId.toString()
  });
};

// Indexes
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ qrCode: 1 });
TicketSchema.index({ ticketNumber: 1 });
TicketSchema.index({ status: 1, expiresAt: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
