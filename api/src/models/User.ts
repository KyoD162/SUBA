import mongoose, { Schema, HydratedDocument, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  city?: string;
  documentId?: string;
  bio?: string;
  role: 'rider' | 'driver' | 'admin';
  comparePassword(candidate: string): Promise<boolean>;
  generateToken(): string;
  generateRefreshToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    city: { type: String },
    documentId: { type: String },
    bio: { type: String },
    role: { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider' },
  },
  { timestamps: true, discriminatorKey: 'role' }
);

UserSchema.pre('save', async function (this: HydratedDocument<IUser>, next: CallbackWithoutResultAndOptionalError) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (this: HydratedDocument<IUser>, candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.generateToken = function (this: HydratedDocument<IUser>) {
  const payload = { userId: this._id.toString(), role: this.role };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, secret, { expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any });
};

// Método para generar refresh token
UserSchema.methods.generateRefreshToken = function (this: HydratedDocument<IUser>) {
  const payload = { userId: this._id.toString(), role: this.role, type: 'refresh' };
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any });
};

export const User = mongoose.model<IUser>('User', UserSchema);
