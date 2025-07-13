'use client'

import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaPlus, FaTrash, FaTimes } from 'react-icons/fa'
import { ref, onChildAdded, onChildRemoved, push, remove, get } from 'firebase/database'
import { db } from '../../../lib/firebase'
import type { DataSnapshot } from 'firebase/database'

interface SessionUser {
  username?: string
  role?: 'admin' | 'user'
}

interface Message {
  id: number
  user: string
  role: 'admin' | 'user'
  text?: string
  mediaUrls?: { url: string; type: 'image' | 'video' }[]
  timestamp: string
}

export default function ForumPage() {
  const { data: session } = useSession()
  const user = session?.user as SessionUser

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [previews, setPreviews] = useState<{ url: string; file: File; type: 'image' | 'video' }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = () => {
    if (!input.trim() && previews.length === 0) return
    if (!user) return alert('You must be logged in.')

    const text = input
      .replace(/@admin/gi, '<span class="text-red-500 font-bold">@admin</span>')
      .replace(/@\w+/g, (tag) => `<span class="text-blue-600 font-semibold">${tag}</span>`)

    const newMessage: Message = {
      id: Date.now(),
      user: user.username || 'anon',
      role: user.role || 'user',
      text,
      timestamp: new Date().toLocaleString(),
      mediaUrls: previews.map((p) => ({ url: p.url, type: p.type }))
    }

    push(ref(db, 'messages'), newMessage)
    setInput('')
    setPreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPreviews = Array.from(files).map((file) => {
        const type = file.type.startsWith('video') ? 'video' : 'image'
        return {
          url: URL.createObjectURL(file),
          file,
          type: type as 'image' | 'video'
        }
      })
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const deleteMessage = async (id: number) => {
    if (user?.role !== 'admin') return alert('Only admin can delete messages.')
    if (!confirm('Delete message?')) return

    const messagesRef = ref(db, 'messages')
    const snapshot = await get(messagesRef)

    snapshot.forEach((child: DataSnapshot) => {
      const msg = child.val()
      if (msg.id === id) {
        remove(child.ref)
      }
    })
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages])

  useEffect(() => {
    const messagesRef = ref(db, 'messages')

    const handleAdd = (snapshot: DataSnapshot) => {
      const msg = snapshot.val()
      if (!msg || !msg.id || !msg.user || !msg.role) return
      setMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]))
    }

    const handleRemove = (snapshot: DataSnapshot) => {
      const deletedMsg = snapshot.val()
      setMessages((prev) => prev.filter((m) => m.id !== deletedMsg.id))
    }

    onChildAdded(messagesRef, handleAdd)
    onChildRemoved(messagesRef, handleRemove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white pt-24 px-4 pb-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-[80vh] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-red-700 px-6 py-3 font-semibold text-white text-lg">Live Chat</div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white text-black">
          {messages.map((msg) => (
            <div key={msg.id} className="relative group">
              <p className="font-semibold text-sm">
                {msg.user} <span className="text-xs italic text-gray-500">({msg.role})</span>
              </p>
              {msg.text && (
                <p
                  className="bg-gray-100 p-2 rounded-md mt-1"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              )}
              {msg.mediaUrls?.map((media, idx) => (
                media.type === 'image' ? (
                  <img
                    key={idx}
                    src={media.url}
                    alt="media"
                    className="mt-2 rounded-md max-w-[60%] shadow"
                  />
                ) : (
                  <video
                    key={idx}
                    src={media.url}
                    controls
                    className="mt-2 rounded-md max-w-[60%] shadow"
                  />
                )
              ))}
              <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
              {user?.role === 'admin' && (
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="absolute top-0 right-0 p-1 text-red-600 hidden group-hover:block"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {previews.length > 0 && (
          <div className="bg-gray-100 p-3 flex flex-wrap gap-3 text-black">
            {previews.map((p, idx) => (
              <div key={idx} className="relative w-24 h-24">
                {p.type === 'image' ? (
                  <img src={p.url} className="w-full h-full object-cover rounded" />
                ) : (
                  <video src={p.url} className="w-full h-full object-cover rounded" controls />
                )}
                <button
                  onClick={() => setPreviews((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-100 p-3 flex items-center gap-2 text-black">
          <button onClick={() => fileInputRef.current?.click()} className="text-gray-600 hover:text-black">
            <FaPlus />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
          <input
            type="text"
            className="flex-grow px-3 py-2 rounded-md border border-gray-300"
            placeholder="Message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="text-blue-600 hover:text-blue-800">
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  )
}
