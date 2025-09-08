import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  username: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  maps?: string;
  slideshow: string[];
}

const BusinessSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true }, // satu user, satu bisnis
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    facebook: String,
    instagram: String,
    whatsapp: String,
    maps: String,
    slideshow: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Business ||
  mongoose.model<IBusiness>("Business", BusinessSchema);
