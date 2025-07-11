
import { Server } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: Server
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      socket.on('chat-message', (msg) => {
        io.emit('chat-message', msg)
      })
    })
  }
  res.end()
}
