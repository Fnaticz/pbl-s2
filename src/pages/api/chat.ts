import { NextApiRequest, NextApiResponse } from 'next'
import Message from '../../models/message'
import { connectDB } from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB()

  if (req.method === 'GET') {
    const messages = await Message.find().sort({ _id: 1 })
    return res.status(200).json(messages)
  }

  if (req.method === 'POST') {
    const { user, role, text, mediaUrls, timestamp } = req.body
    const message = await Message.create({ user, role, text, mediaUrls, timestamp })
    return res.status(201).json(message)
  }

  return res.status(405).end()
}
