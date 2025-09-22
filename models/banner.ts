import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  _id: string;
  name: string;
  imageUrl: string;
  uploadedAt: Date;
  title?: string;
  eventDate?: Date;
  locationUrl?: string;
}

const BannerSchema = new Schema<IBanner>({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  title: { type: String },
  eventDate: { type: Date },
  locationUrl: { type: String },
});

export default mongoose.models.Banner ||
  mongoose.model<IBanner>("Banner", BannerSchema);
