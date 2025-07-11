import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../lib/mongodb'
import Activity from '../../../models/activity'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.body

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid activity ID' })
  }

  try {
    await connectDB()

    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    await Activity.findByIdAndDelete(id)

    res.status(200).json({ message: 'Activity deleted successfully' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: 'Failed to delete activity' })
  }
}
