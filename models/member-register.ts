import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IMemberApplication extends Document {
  userId: mongoose.Types.ObjectId;  // referensi ke User
  username: string;
  emailOrPhone: string;
  name: string;
  address: string;
  phone: string;
  hobby: string;
  vehicleType: string;
  vehicleSpec: string;
  status: "pending" | "approved" | "rejected";
  date: Date;
}

const MemberApplicationSchema = new Schema<IMemberApplication>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ harus ObjectId
  username: { type: String, required: true },
  emailOrPhone: { type: String, required: true },
  name: String,
  address: String,
  phone: String,
  hobby: String,
  vehicleType: String,
  vehicleSpec: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  date: { type: Date, default: Date.now },
});

const MemberApplication =
  models.MemberApplication || model<IMemberApplication>("MemberApplication", MemberApplicationSchema);

export default MemberApplication;
