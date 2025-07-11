import mongoose, { Schema, Document } from 'mongoose';

export interface IFinance extends Document {
  description: string;
  amount: number;
  date: Date;
}

const FinanceSchema = new Schema<IFinance>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
});

export default mongoose.models.Finance || mongoose.model<IFinance>('Finance', FinanceSchema);
