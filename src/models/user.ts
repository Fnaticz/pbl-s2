import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  emailOrPhone: string;
  /**
   * Untuk user yang daftar via Credentials, password akan terisi.
   * Untuk user yang daftar via Google OAuth, password bisa kosong.
   */
  password?: string;
  /**
   * Alamat tidak wajib untuk user Google OAuth.
   */
  address?: string;
  avatar?: string;
  role: 'guest' | 'member' | 'admin';
  emailVerified?: boolean;
  date?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    emailOrPhone: { type: String, required: true, unique: true },
    // password & address dibuat tidak wajib supaya user dari Google bisa disimpan
    password: { type: String, required: false, default: '' },
    address: { type: String, required: false, default: '' },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['guest', 'member', 'admin'],
      default: 'guest',
    },
    emailVerified: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;
