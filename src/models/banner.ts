import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  _id: string;
  name: string;        
  title: string;       
  eventDate: string;   
  location: string;    
  imageUrl: string;    
  uploadedAt: Date;
}

const BannerSchema = new Schema<IBanner>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  eventDate: { type: String, required: true },
  location: { type: String, required: true },
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Banner ||
  mongoose.model<IBanner>("Banner", BannerSchema);
