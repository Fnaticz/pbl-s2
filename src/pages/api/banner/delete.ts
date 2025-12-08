// /pages/api/banner/delete.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { connectDB } from '../../../lib/mongodb'
import Banner from '../../../models/banner'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const { id } = req.body
  if (!id) return res.status(400).json({ message: 'Missing banner ID' })

  try {
    await connectDB()
    const banner = await Banner.findById(id)
    if (!banner) return res.status(404).json({ message: 'Banner not found' })
    await Banner.findByIdAndDelete(id)
    res.status(200).json({ message: 'Banner deleted from database' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
