// pages/api/inbox/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../lib/mongodb'
import Inbox from '../../../models/inbox'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await connectDB()
      const messages = await Inbox.find().sort({ date: -1 })
      return res.status(200).json(messages)
    } catch (err) {
      console.error('Inbox fetch error:', err)
      return res.status(500).json({ message: 'Failed to fetch inbox messages' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) return res.status(400).json({ message: 'Missing ID' })

    try {
      await connectDB()
      await Inbox.findByIdAndDelete(id)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Inbox delete error:', err)
      return res.status(500).json({ message: 'Failed to delete inbox message' })
    }
  }

  return res.status(405).end()
}
