import mongoose, { Schema, Document } from "mongoose";

export interface IMainEvent extends Document {
    _id: string;
    title: string;
    date: string;
    location: string;
    desc: string;
    name: string;
    imageUrl: string;
    createdAt: Date;
}

const MainEventSchema = new Schema<IMainEvent>({
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    desc: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.MainEvent ||
    mongoose.model<IMainEvent>("MainEvent", MainEventSchema);
