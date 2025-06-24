import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  type: 'image' | 'video';
  url: string;
  username: string;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  username: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);