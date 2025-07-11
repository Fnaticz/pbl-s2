// /pages/api/socket.ts
import { Server } from 'socket.io'

let io: Server

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      socket.on('chat-message', (msg) => {
        socket.broadcast.emit('chat-message', msg)
      })
    })
  }
  res.end()
}
