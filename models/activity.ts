import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  title: string;
  name: string;
  desc: string;
  imageUrl: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  title: { type: String, required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
