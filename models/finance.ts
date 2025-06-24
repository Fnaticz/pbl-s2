import mongoose, { Schema, Document } from 'mongoose';

export interface IFinance extends Document {
  description: string;
  amount: number;
  date: string;
}

const FinanceSchema = new Schema<IFinance>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
});

export default mongoose.models.Finance || mongoose.model<IFinance>('Finance', FinanceSchema);
