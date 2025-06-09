import mongoose from "mongoose";
const uri = process.env.MONGO_URI!;
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(uri);
};
