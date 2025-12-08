import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  type: 'image' | 'video';
  url: string;
  username: string;
  cloudinaryPublicId?: string;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  username: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);