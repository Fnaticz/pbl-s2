'use client'

import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { FaSignOutAlt, FaBars, FaUser, FaPaperPlane, FaPlus, FaTrash, FaTimes } from 'react-icons/fa'
import { ref, onChildAdded, onChildRemoved, push, remove, get } from 'firebase/database'
import { db } from '../../../lib/firebase'
import { storage } from '../../../lib/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import type { DataSnapshot } from 'firebase/database'
import Image from "next/image";
import Loading from '../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession()
  const user = session?.user as SessionUser
  const [activeTab, setActiveTab] = useState('forum')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [previews, setPreviews] = useState<{ url: string; file: File; type: 'image' | 'video' }[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = async () => {
    if (!input.trim() && previews.length === 0) return
    if (!user) return alert('You must be logged in.')
    if (uploading) return alert('Please wait for uploads to complete.')

    try {
      const text = input
        .replace(/@admin/gi, '<span class="text-red-500 font-bold">@admin</span>')
        .replace(/@\w+/g, (tag) => `<span class="text-blue-600 font-semibold">${tag}</span>`)

      const newMessage: Message = {
        id: Date.now(),
        user: user.username || 'anon',
        role: user.role || 'user',
        text: text || undefined,
        timestamp: new Date().toLocaleString(),
        mediaUrls: previews.length > 0 ? previews.map((p) => ({ url: p.url, type: p.type })) : undefined
      }

      await push(ref(db, 'messages'), newMessage)
      setInput('')
      setPreviews([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const uploadedMedia: { url: string; file: File; type: 'image' | 'video' }[] = []
    const fileArray = Array.from(files)

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const fileId = Date.now() + i
        
        // Validate file size (max 50MB for videos, 10MB for images)
        const maxSize = file.type.startsWith("video") ? 50 * 1024 * 1024 : 10 * 1024 * 1024
        if (file.size > maxSize) {
          alert(`${file.name} is too large. Max size: ${file.type.startsWith("video") ? '50MB' : '10MB'}`)
          continue
        }

        // Validate file type
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          alert(`${file.name} is not a valid image or video file.`)
          continue
        }

        try {
          const folder = file.type.startsWith("video") ? "videos" : "images"
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const fileRef = storageRef(storage, `forum/${folder}/${fileName}`)
          
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))
          
          await uploadBytes(fileRef, file)
          const downloadURL = await getDownloadURL(fileRef)

          uploadedMedia.push({
            url: downloadURL,
            file,
            type: file.type.startsWith("video") ? "video" : "image"
          })

          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }))
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          alert(`Failed to upload ${file.name}. Please try again.`)
        }
      }

      if (uploadedMedia.length > 0) {
        setPreviews((prev) => [...prev, ...uploadedMedia])
      }
    } catch (error) {
      console.error('Error handling file upload:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress({})
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const deleteMessage = async (id: number) => {
    if (user?.role !== 'admin') return alert('Only admin can delete messages.')
    if (!confirm('Delete message?')) return

    const messagesRef = ref(db, 'messages')
    const snapshot = await get(messagesRef)

    snapshot.forEach((child: DataSnapshot) => {
      const msg = child.val()
      if (msg.id === id) remove(child.ref)
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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

  if (loading) return <Loading />

  const renderSection = () => {
    switch (activeTab) {
      case 'forum':
        return (
          <div className="mx-auto w-full flex flex-col h-[87vh] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-red-950 px-6 py-3 font-semibold text-white text-lg">Live Chat</div>

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

                  {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.mediaUrls.map((media, idx) =>
                        media.type === 'image' ? (
                          <div key={idx} className="relative group/media">
                            <Image
                              src={media.url}
                              alt={`Image from ${msg.user}`}
                              width={400}
                              height={400}
                              className="rounded-md max-w-[60%] max-h-[400px] object-contain shadow cursor-pointer"
                              unoptimized
                              onError={(e) => {
                                console.error('Image load error:', media.url)
                                e.currentTarget.src = '/placeholder-image.png'
                              }}
                            />
                            <a
                              href={media.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/media:opacity-100 transition-opacity rounded-md"
                            >
                              <span className="text-white text-sm">Click to view full size</span>
                            </a>
                          </div>
                        ) : (
                          <video
                            key={idx}
                            src={media.url}
                            controls
                            className="mt-2 rounded-md max-w-[60%] max-h-[400px] shadow"
                            preload="metadata"
                            onError={() => {
                              console.error('Video load error:', media.url)
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )
                      )}
                    </div>
                  )}

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
                      <Image 
                        src={p.url} 
                        alt="Preview" 
                        width={96} 
                        height={96} 
                        className="w-full h-full object-cover rounded"
                        unoptimized
                      />
                    ) : (
                      <video 
                        src={p.url} 
                        className="w-full h-full object-cover rounded" 
                        controls
                        preload="metadata"
                      />
                    )}
                    <button
                      onClick={() => setPreviews((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                      disabled={uploading}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="bg-yellow-50 p-2 text-black text-sm text-center">
                Uploading files... Please wait.
              </div>
            )}

            <div className="bg-gray-100 p-3 flex items-center gap-2 text-black">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
                title="Upload photo/video"
              >
                <FaPlus />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
                multiple
                disabled={uploading}
              />

              <input
                type="text"
                className="flex-grow px-3 py-2 rounded-md border border-gray-300"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !uploading && sendMessage()}
                disabled={uploading}
              />

              <button 
                onClick={sendMessage} 
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || (!input.trim() && previews.length === 0)}
                title="Send message"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        )
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>Forum Discuss</span>
        <button
          onClick={() =>
            window.innerWidth < 768
              ? setMobileSidebar(false)
              : setSidebarOpen(!sidebarOpen)
          }
          className="text-white"
        >
          {window.innerWidth < 768 ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        <button
          onClick={() => {
            setActiveTab('forum')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'forum'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaUser />
          {sidebarOpen && 'Forum'}
        </button>
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-red-600 text-white font-semibold"
        >
          <FaSignOutAlt />
          {sidebarOpen && 'Leave Forum'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black to-red-950 to-black text-white">
      <aside
        className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'
          } bg-gray-900 h-screen flex flex-col transition-all duration-300`}
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileSidebar && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebar(false)}
          >
            <motion.div
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute left-0 top-0 w-64 h-full bg-gray-900 shadow-xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 h-screen overflow-y-auto p-6 relative">
        <h1 className="absolute top-4 right-4 text-white md:hidden text-lg font-semibold mb-2">Forum Discuss</h1>

        <button
          onClick={() => setMobileSidebar(true)}
          className="absolute top-4 left-4 text-white md:hidden"
        >
          <FaBars size={24} />
        </button>

        <div className="bg-black/20 backdrop-blur-sm p-6 rounded shadow min-h-full mt-10 md:mt-0">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}
