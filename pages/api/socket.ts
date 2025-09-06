import { Server as IOServer } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { NextApiResponseWithSocket } from '../../types/next'

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) return res.status(200).end()

  const io = new IOServer(res.socket.server, { path: '/api/socket' })
  res.socket.server.io = io

  io.on('connection', socket => {
    socket.on('chat-message', (msg) => io.emit('chat-message', msg))
  })

  res.status(200).end()
}
