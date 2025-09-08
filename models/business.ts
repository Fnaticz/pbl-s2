import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  owner: string;
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema: Schema = new Schema(
  {
    owner: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    coverImage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Business ||
  mongoose.model<IBusiness>("Business", BusinessSchema);
