import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../lib/mongodb'
import MainEvent from '../../../models/main-event'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const { id } = req.body

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid main event ID' })
    }

    try {
        await connectDB()

        const mainevent = await MainEvent.findById(id)
        if (!mainevent) {
            return res.status(404).json({ message: 'Main event not found' })
        }

        await MainEvent.findByIdAndDelete(id)

        res.status(200).json({ message: 'Main event deleted successfully' })
    } catch (err) {
        console.error('Delete error:', err)
        res.status(500).json({ message: 'Failed to delete main event' })
    }
}
