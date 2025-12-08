// models/message.ts
import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  user: String,
  role: String,
  text: String,
  mediaUrls: [
    {
      url: String,
      type: { type: String, enum: ['image', 'video'] }
    }
  ],
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.models.Message || mongoose.model('Message', MessageSchema)
