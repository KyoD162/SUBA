import { Schema } from 'mongoose';

import { User, IUser } from './User';

export interface IAdmin extends IUser {
  department?: string;
  permissions: string[];
}

const AdminSchema = new Schema<IAdmin>({
  department: { type: String },
  permissions: { type: [String], default: [] }
});

export const Admin = User.discriminator<IAdmin>('admin', AdminSchema);
