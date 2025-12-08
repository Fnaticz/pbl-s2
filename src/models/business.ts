import mongoose, { Schema, models } from "mongoose";

const BusinessSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
  voucher: [{ type: mongoose.Schema.Types.ObjectId, ref: "Voucher" }],
  slideshow: [String],
}, { timestamps: true });

const Business = models.Business || mongoose.model("Business", BusinessSchema);
export default Business;
