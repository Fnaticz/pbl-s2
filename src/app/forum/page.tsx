'use client'

import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaPlus, FaTrash, FaTimes } from 'react-icons/fa'
import { ref, onChildAdded, push } from 'firebase/database'
import { db } from '../../../lib/firebase'

type SessionUser = {
  username?: string
  role?: 'admin' | 'user'
}

type Message = {
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
    if (!session?.user) return alert('You must be logged in.')

    const text = input
      .replace(/@admin/gi, '<span class="text-red-500 font-bold">@admin</span>')
      .replace(/@\w+/g, (tag: string) => `<span class="text-blue-600 font-semibold">${tag}</span>`)

    const mediaUrls = previews.map((p) => ({ url: p.url, type: p.type }))

    const newMessage: Message = {
      id: Date.now(),
      user: user.username || 'anon',
      role: user.role || 'user',
      text: text || undefined,
      mediaUrls: mediaUrls.length ? mediaUrls : undefined,
      timestamp: new Date().toLocaleString()
    }

    push(ref(db, 'messages'), newMessage)
    setInput('')
    setPreviews([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPreviews = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        file,
        type: file.type.startsWith('video') ? 'video' as const : 'image' as const
      }))
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const deleteMessage = (id: number) => {
    if (confirm('Delete message?')) {
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const messagesRef = ref(db, 'messages')
    onChildAdded(messagesRef, (snapshot) => {
      const msg = snapshot.val()
      setMessages((prev) => [...prev, msg])
    })
  }, [])

  return (
    <div className="min-h-screen pt-24 px-4 pb-8 bg-black text-white flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-4">Live Chat</h1>
      <div className="bg-white text-black rounded shadow flex flex-col flex-grow max-h-[70vh] overflow-hidden">
        <div className="px-4 py-3 bg-red-700 text-white font-semibold">Messages</div>

        <div className="p-4 overflow-y-auto space-y-4 flex-grow">
          {messages.map((msg) => (
            <div key={msg.id} className="relative group">
              <p className="font-semibold text-gray-800 text-sm">
                {msg.user} <span className="italic text-xs text-gray-500">({msg.role})</span>
              </p>
              {msg.text && (
                <p
                  className="bg-gray-200 text-black p-2 rounded max-w-[80%]"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              )}
              {msg.mediaUrls?.map((media, idx) =>
                media.type === 'image' ? (
                  <img key={idx} src={media.url} alt="uploaded media" className="mt-2 max-w-[60%] rounded shadow" />
                ) : (
                  <video key={idx} src={media.url} controls className="mt-2 max-w-[60%] rounded shadow" />
                )
              )}
              <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
              <button
                onClick={() => deleteMessage(msg.id)}
                className="absolute top-0 right-0 p-1 text-red-600 hidden group-hover:block"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {previews.length > 0 && (
          <div className="bg-gray-100 p-3 flex flex-wrap gap-3 text-black">
            {previews.map((p, idx) => (
              <div key={idx} className="relative w-24">
                {p.type === 'image' ? (
                  <img src={p.url} alt="preview" className="w-24 h-24 object-cover rounded" />
                ) : (
                  <video src={p.url} className="w-24 h-24 object-cover rounded" controls />
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

        <div className="p-3 bg-gray-100 flex gap-2 items-center">
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
            className="flex-grow px-3 py-2 rounded text-black"
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
