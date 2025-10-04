import mongoose, { Schema, Document, models, model } from 'mongoose';
import { connectDB } from '../lib/mongodb';

export interface IParticipant extends Document {
    userId: mongoose.Types.ObjectId;
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
    role: 'member';
    date: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
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
        role: {
            type: String,
            default: 'member',
        },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Participant = models.Participant || model<IParticipant>('Participant', ParticipantSchema);

export default Participant;
