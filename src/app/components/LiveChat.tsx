'use client'

import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import type { Socket } from 'socket.io-client'

let socket: Socket;


export default function LiveChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket = io({
      path: '/api/socket'
    });

    socket.on('chat message', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('chat message', input);
    setInput('');
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded w-full max-w-md mx-auto">
      <div className="h-64 overflow-y-auto mb-4 border border-white p-2">
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">{msg}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow px-2 py-1 text-black rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 px-3 py-1 rounded">Send</button>
      </div>
    </div>
  )
}
