import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  date: string;
  title: string;
  created: string;
}

const ScheduleSchema = new Schema<ISchedule>({
  date: { type: String, required: true },
  title: { type: String, required: true },
  created: { type: String, required: true },
});

export default mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);
