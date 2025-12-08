import { connectDB } from '../../../lib/mongodb';
import Participant from '../../../models/participant';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { id } = req.body

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid Member ID' })
    }

    try {
        await connectDB()

        const participants = await Participant.findById(id)
        if (!participants) {
            return res.status(404).json({ message: 'Member not found' })
        }

        await Participant.findByIdAndDelete(id)

        res.status(200).json({ message: 'Member deleted successfully' })
    } catch (err) {
        console.error('Delete error:', err)
        res.status(500).json({ message: 'Failed to delete Member' })
    }
}
