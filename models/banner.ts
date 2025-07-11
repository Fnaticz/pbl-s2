import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner {
    _id: string;
    name: string;
    imageUrl: string;
    uploadedAt: Date;
}

const BannerSchema = new Schema<IBanner>({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
