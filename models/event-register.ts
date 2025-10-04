import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IEventApplication extends Document {
  userId: mongoose.Types.ObjectId; // referensi ke User
  username: string;
  emailOrPhone: string;
  driverName: string;
  coDriverName: string;
  carName: string;
  driverPhone: string;
  coDriverPhone: string;
  policeNumber: string;
  address: string;
  teamName: string;
  status: "pending" | "approved";
  date: Date;
}

const EventApplicationSchema = new Schema<IEventApplication>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ relasi ke User
    username: { type: String, required: true },
    emailOrPhone: { type: String, required: true },
    driverName: String,
    coDriverName: String,
    carName: String,
    driverPhone: String,
    coDriverPhone: String,
    policeNumber: String,
    address: String,
    teamName: String,
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    date: { type: Date, default: Date.now },
  },
);

const EventApplication =
  models.EventApplication || model<IEventApplication>("EventApplication", EventApplicationSchema);

export default EventApplication;
