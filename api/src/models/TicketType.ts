import mongoose, { Schema, Document } from 'mongoose';

export type TicketTypeCategory = 'single' | 'multi' | 'time_based';

export interface ITicketType extends Document {
  name: string;
  description: string;
  category: TicketTypeCategory;
  price: number; // Price in USD
  usageLimit: number | null; // null for unlimited, number for specific uses
  durationMinutes: number | null; // null for non-time-based, number for duration in minutes
  isActive: boolean;
  color: string; // HEX color for display
  icon: string; // Icon name (e.g., 'ticket', 'bus', 'calendar')
  createdAt: Date;
  updatedAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100 
    },
    description: { 
      type: String, 
      required: true,
      maxlength: 500 
    },
    category: { 
      type: String, 
      enum: ['single', 'multi', 'time_based'], 
      required: true 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    usageLimit: { 
      type: Number, 
      default: null,
      min: 1 
    },
    durationMinutes: { 
      type: Number, 
      default: null,
      min: 1 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    color: { 
      type: String, 
      default: '#0891B2' // Default cyan color
    },
    icon: { 
      type: String, 
      default: 'ticket' 
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for faster queries
TicketTypeSchema.index({ isActive: 1 });
TicketTypeSchema.index({ category: 1 });

export const TicketType = mongoose.model<ITicketType>('TicketType', TicketTypeSchema);
