import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IVoucher extends Document {
  businessId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  pointsRequired: number;
  expiryDate: Date;
  stock: number;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    title: { type: String, required: true },
    description: { type: String },
    pointsRequired: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Voucher || model<IVoucher>("Voucher", VoucherSchema);
