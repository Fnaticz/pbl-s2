import mongoose from "mongoose";

export interface IVoucherRedemption {
  userId: mongoose.Types.ObjectId;
  voucherId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  redeemedAt: Date;
  pointsUsed: number;
  status: "active" | "used" | "expired" | "deleted";
}

const VoucherRedemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher", required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
  redeemedAt: { type: Date, default: Date.now },
  pointsUsed: Number,
  status: { type: String, enum: ["active", "used", "expired", "deleted"], default: "active" },
});

export default mongoose.models.VoucherRedemption ||
  mongoose.model("VoucherRedemption", VoucherRedemptionSchema);
