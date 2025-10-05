import mongoose, { Schema, Document, models, model } from 'mongoose';
import { connectDB } from '../lib/mongodb';

export interface IUser extends Document {
  username: string;
  emailOrPhone: string;
  password: string;
  address: string;
  avatar: { type: String, default: '' }
  role: 'guest' | 'member' | 'admin';
  date: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    emailOrPhone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['guest', 'member', 'admin'],
      default: 'guest',
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;
