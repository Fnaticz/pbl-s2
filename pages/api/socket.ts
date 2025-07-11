import { Server as IOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextApiResponseServerIO } from '../../types/next'

type NextApiResponseWithSocket = NextApiResponse & NextApiResponseServerIO

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket.io server already running')
    res.status(200).end()
    return
  }

  const io = new IOServer(res.socket.server, {
    path: '/api/socketio',
  })

  res.socket.server.io = io

  io.on('connection', (socket) => {
    console.log('New socket connection')

    socket.on('chat-message', (msg) => {
      socket.broadcast.emit('chat-message', msg)
    })
  })

  console.log('Socket.io server initialized')
  res.status(200).end()
}
