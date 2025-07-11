import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { connectDB } from '../../lib/mongodb'
import User from '../../models/user'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.username) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await connectDB()

  const user = await User.findOne({ username: session.user.username }).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })

  return res.status(200).json(user)
}
