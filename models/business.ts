import mongoose, { Schema, models } from "mongoose";

const businessSchema = new Schema({
  username: { type: String, required: true },
  name: String,
  category: String,
  description: String,
  address: String,
  phone: String,
  facebook: String,
  instagram: String,
  whatsapp: String,
  maps: String,
  slideshow: [String],
}, { timestamps: true });

const Business = models.Business || mongoose.model("Business", businessSchema);
export default Business;
