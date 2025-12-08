import mongoose from "mongoose";

const PointSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  points: { type: Number, default: 0 },
  history: [
    {
      eventName: String,
      date: { type: Date, default: Date.now },
      earned: Number,
    },
  ],
});

export default mongoose.models.Point || mongoose.model("Point", PointSchema);
