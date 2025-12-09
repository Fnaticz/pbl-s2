import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  emailOrPhone: string;
  password?: string;
  address?: string;
  avatar?: string;
  googleId?: string;
  role: 'guest' | 'member' | 'admin';
  date?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    emailOrPhone: { type: String, required: true, unique: true },
    password: { type: String, required: false, default: '' },
    address: { type: String, required: false, default: '' },
    avatar: { type: String, default: '' },
    googleId: { type: String, required: false },
    role: { type: String, enum: ['guest', 'member', 'admin'], default: 'guest' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;
