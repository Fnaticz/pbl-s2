import { io, Socket } from 'socket.io-client'

const socket: Socket = io({
  path: '/api/socket',
  autoConnect: false,
})

export default socket
