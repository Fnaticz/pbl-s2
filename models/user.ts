import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  emailOrPhone: string;
  password: string;
  address: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  emailOrPhone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
});


export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
