import mongoose, { Schema, HydratedDocument, CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser {
  email: string;
  password: string;
  role: 'rider' | 'driver' | 'admin';
  comparePassword(candidate: string): Promise<boolean>;
  generateToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider' },
  },
  { timestamps: true }
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
  const secret = process.env.JWT_SECRET || '';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const User = mongoose.model<IUser>('User', UserSchema);
