import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IVerification extends Document {
  email: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt?: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-delete expired documents
VerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Verification = models.Verification || model<IVerification>('Verification', VerificationSchema);

export default Verification;

