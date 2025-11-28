'use client'

import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { FaSignOutAlt, FaBars, FaUser, FaPaperPlane, FaPlus, FaTrash, FaTimes, FaEdit } from 'react-icons/fa'
import { ref, onChildAdded, onChildRemoved, push, remove, get } from 'firebase/database'
import { db } from '../../../lib/firebase'
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
  const [userAvatars, setUserAvatars] = useState<{ [username: string]: string | null }>({})
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: number } | null>(null)
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

      // Filter dan map previews dengan memastikan tidak ada undefined
      const validMediaUrls = previews.length > 0 
        ? previews
            .filter((p) => p && p.url && p.type) // Filter out any undefined/null
            .map((p) => ({ 
              url: String(p.url), 
              type: String(p.type) 
            }))
        : null

      // Buat message object tanpa undefined values
      const newMessage: any = {
        id: Date.now(),
        user: user.username || 'anon',
        role: user.role || 'user',
        timestamp: new Date().toLocaleString(),
      }

      // Hanya tambahkan text jika ada
      if (text && text.trim()) {
        newMessage.text = text
      }

      // Hanya tambahkan mediaUrls jika ada valid media
      if (validMediaUrls && validMediaUrls.length > 0) {
        newMessage.mediaUrls = validMediaUrls
      }

      await push(ref(db, 'messages'), newMessage)
      setInput('')
      setPreviews([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Gagal mengirim pesan. Silakan coba lagi.')
    }
  }

  const fetchUserAvatar = async (username: string) => {
    if (userAvatars[username]) return userAvatars[username]
    
    try {
      const res = await fetch(`/api/user/avatar?username=${encodeURIComponent(username)}`)
      if (res.ok) {
        const data = await res.json()
        setUserAvatars(prev => ({ ...prev, [username]: data.avatar }))
        return data.avatar
      }
    } catch (err) {
      console.error('Failed to fetch avatar:', err)
    }
    return null
  }

  const getAvatarSrc = (avatar: string | null | undefined, username: string) => {
    if (!avatar) return "/defaultavatar.png"
    if (avatar.startsWith("data:image")) return avatar
    if (avatar.startsWith("http") || avatar.startsWith("//")) return avatar
    if (avatar.startsWith("/")) return avatar
    return `/uploads/${avatar}`
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Validasi file size (max 100MB per file)
    const maxSize = 100 * 1024 * 1024 // 100MB
    const invalidFiles = Array.from(files).filter(f => f.size > maxSize)
    if (invalidFiles.length > 0) {
      alert(`File terlalu besar. Maksimal 100MB per file.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        // Validasi tipe file
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert(`File ${file.name} bukan gambar atau video.`)
          continue
        }
        formData.append('file', file)
      }

      // Cek apakah ada file yang valid
      if (formData.getAll('file').length === 0) {
        alert('Tidak ada file yang valid untuk diupload.')
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const response = await fetch('/api/chat/upload-local', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Upload gagal'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || 'Upload failed'
          if (errorData.details) {
            errorMessage += `: ${errorData.details}`
          }
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (!data.media || data.media.length === 0) {
        throw new Error('No files were uploaded. Server returned empty media array.')
      }

      // Filter dan map dengan validasi
      const uploadedMedia = data.media
        .filter((item: { url?: string; type?: string }) => {
          if (!item || !item.url || !item.type) {
            console.warn('Invalid media item:', item)
            return false
          }
          return true
        })
        .map((item: { url: string; type: 'image' | 'video' }) => {
          // Gunakan URL langsung dari server (local file system)
          const fileUrl = String(item.url)
          
          return {
            url: fileUrl,
            file: files[0], // Keep file reference for preview
            type: item.type === 'video' ? 'video' as const : 'image' as const
          }
        })

      if (uploadedMedia.length > 0) {
        setPreviews((prev) => [...prev, ...uploadedMedia])
        console.log(`Successfully uploaded ${uploadedMedia.length} file(s)`)
      } else {
        throw new Error('No valid media files were processed.')
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Gagal mengupload file. Silakan coba lagi.'
      alert(errorMessage)
    } finally {
      setUploading(false)
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
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev
        fetchUserAvatar(msg.user)
        return [...prev, msg]
      })
    }

    const handleRemove = (snapshot: DataSnapshot) => {
      const deletedMsg = snapshot.val()
      setMessages((prev) => prev.filter((m) => m.id !== deletedMsg.id))
    }

    onChildAdded(messagesRef, handleAdd)
    onChildRemoved(messagesRef, handleRemove)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Fetch avatars for existing messages - hanya sekali per user baru
    const newUsers = messages
      .map(msg => msg.user)
      .filter(username => !userAvatars[username])
    
    if (newUsers.length > 0) {
      newUsers.forEach(username => {
        fetchUserAvatar(username)
      })
    }
  }, [messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  if (loading) return <Loading />

  const renderSection = () => {
    switch (activeTab) {
      case 'forum':
        return (
          <div className="mx-auto w-full flex flex-col h-[85vh] sm:h-[87vh] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-red-950 px-6 py-3 font-semibold text-white text-lg">Live Chat</div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white text-black">
              {messages.map((msg) => {
                const avatar = userAvatars[msg.user] || null
                const avatarSrc = getAvatarSrc(avatar, msg.user)
                
                return (
                <div 
                  key={msg.id} 
                  className="relative group flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onContextMenu={(e) => {
                    if (user?.role === 'admin') {
                      e.preventDefault()
                      setContextMenu({ x: e.clientX, y: e.clientY, messageId: msg.id })
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Image
                      src={avatarSrc}
                      alt={msg.user}
                      width={40}
                      height={40}
                      className="rounded-full object-cover border-2 border-gray-300"
                      unoptimized
                    />
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">
                        {msg.user} <span className="text-xs italic text-gray-500">({msg.role})</span>
                      </p>
                    </div>

                    {msg.text && (
                      <p
                        className="bg-gray-100 p-2 rounded-md mt-1 break-words"
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                    )}

                    {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.mediaUrls.map((media, idx) => {
                          // Normalize URL - handle both local and external URLs
                          const mediaUrl = media.url.startsWith('/') 
                            ? media.url 
                            : (media.url.startsWith('http') 
                              ? media.url 
                              : `/${media.url}`)
                          
                          return media.type === 'image' ? (
                            <div key={idx} className="relative group/media">
                              <Image
                                src={mediaUrl}
                                alt={`Image from ${msg.user}`}
                                width={400}
                                height={400}
                                className="rounded-md max-w-full sm:max-w-[60%] max-h-[400px] object-contain shadow cursor-pointer"
                                unoptimized
                                onError={(e) => {
                                  console.error('Image load error:', mediaUrl)
                                  e.currentTarget.src = '/placeholder-image.png'
                                }}
                              />
                              <a
                                href={mediaUrl}
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
                              src={mediaUrl}
                              controls
                              className="mt-2 rounded-md max-w-full sm:max-w-[60%] max-h-[400px] shadow"
                              preload="metadata"
                              onError={(e) => {
                                console.error('Video load error:', mediaUrl)
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          )
                        })}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>
                  </div>

                  {/* Delete button on hover (admin only) */}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute top-2 right-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete message"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              )})}
              
              {/* Context Menu for right-click delete (admin only) */}
              {contextMenu && user?.role === 'admin' && (
                <div
                  className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-2 min-w-[120px]"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      deleteMessage(contextMenu.messageId)
                      setContextMenu(null)
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <FaTrash size={14} />
                    <span>Hapus Pesan</span>
                  </button>
                </div>
              )}
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

            <div className="bg-gray-100 p-2 sm:p-3 flex items-center gap-2 text-black">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="text-gray-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:p-1"
                disabled={uploading}
                title="Upload photo/video"
              >
                <FaPlus size={18} />
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
                className="flex-1 px-2 sm:px-3 py-2 rounded-md border border-gray-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !uploading && sendMessage()}
                disabled={uploading}
              />

              <button 
                onClick={sendMessage} 
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:p-1"
                disabled={uploading || (!input.trim() && previews.length === 0)}
                title="Send message"
              >
                <FaPaperPlane size={18} />
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
        <button
          onClick={() => {
            window.location.href = '/profilesetting'
            setMobileSidebar(false)
          }}
          className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-red-500"
        >
          <FaEdit />
          {sidebarOpen && 'Edit Profile'}
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
