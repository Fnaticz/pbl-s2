// types/next.d.ts
import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'
import type { Server as IOServer } from 'socket.io'
import type { NextApiResponse } from 'next'

export type NextApiResponseServerIO = {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServer
    }
  }
}

export type NextApiResponseWithSocket = NextApiResponse & NextApiResponseServerIO
