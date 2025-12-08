import mongoose, { Schema, Document } from 'mongoose';

export interface IInbox extends Document {
  from: string;
  to: string;
  type: 'admin' | 'tag';
  content: string;
  date: string;
}

const InboxSchema = new Schema<IInbox>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  type: { type: String, enum: ['admin', 'tag'], required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.models.Inbox || mongoose.model<IInbox>('Inbox', InboxSchema);
