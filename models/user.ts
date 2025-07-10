import mongoose, { Schema, Document, models, model } from 'mongoose';
import { connectDB } from '../lib/mongodb';

export interface IUser extends Document {
  username: string;
  emailOrPhone: string;
  password: string;
  address: string;
  role: 'guest' | 'member' | 'admin';
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    emailOrPhone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    role: {
      type: String,
      enum: ['guest', 'member', 'admin'],
      default: 'guest',
    },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;
