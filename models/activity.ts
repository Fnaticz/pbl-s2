import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  _id: string;
  name: string;
  title: string;
  desc: string;
  images: string[];
  date: Date;
}

const ActivitySchema = new Schema<IActivity>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  images: [{ type: String, required: true }],
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);
