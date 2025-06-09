'use client'
import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaPlus, FaTrash, FaTimes } from 'react-icons/fa'

type Message = {
    id: number
    user: string
    text?: string
    mediaUrls?: { url: string; type: 'image' | 'video' }[]
    timestamp: string
}

export default function ForumPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [previews, setPreviews] = useState<{ url: string; file: File; type: 'image' | 'video' }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const newPreviews: { url: string; file: File; type: 'image' | 'video' }[] =
                Array.from(files).map((file) => {
                    const url = URL.createObjectURL(file)
                    const type = file.type.startsWith('video') ? 'video' : 'image'
                    return { url, file, type }
                })
            setPreviews((prev) => [...prev, ...newPreviews])
        }
    }


    const sendMessage = () => {
        if (!input.trim() && previews.length === 0) return

        let text = input.trim()
        text = text.replace(/@admin/gi, '<span class="text-red-500 font-bold">@admin</span>')
        text = text.replace(/@\w+/g, (tag) => `<span class="text-blue-600 font-semibold">${tag}</span>`)

        const mediaUrls = previews.map((p) => ({ url: p.url, type: p.type }))

        const newMessage: Message = {
            id: Date.now(),
            user: 'you',
            text: text || undefined,
            mediaUrls: mediaUrls.length ? mediaUrls : undefined,
            timestamp: new Date().toLocaleString()
        }

        setMessages((prev) => [...prev, newMessage])
        setInput('')
        setPreviews([])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const deleteMessage = (id: number) => {
        const confirmDelete = confirm('Are you sure you want to delete this message?')
        if (confirmDelete) {
            setMessages((prev) => prev.filter((msg) => msg.id !== id))
        }
    }

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white flex flex-col pt-32 px-4 pb-6">
            <h1 className="text-3xl font-bold text-center mb-6">FORUM DISCUSS</h1>

            <div className="flex flex-col bg-white text-black rounded-lg shadow-lg flex-grow max-h-[70vh] overflow-hidden">
                <div className="bg-red-900 text-white px-4 py-3 text-lg font-semibold">Messages</div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white">
                    {messages.map((msg) => (
                        <div key={msg.id} className="relative group">
                            <p className="text-sm font-semibold mb-1 text-gray-800">{msg.user}</p>
                            {msg.text && (
                                <p
                                    className="bg-gray-200 text-black px-3 py-2 rounded-lg max-w-[80%] break-words"
                                    dangerouslySetInnerHTML={{ __html: msg.text }}
                                ></p>
                            )}
                            {msg.mediaUrls && msg.mediaUrls.map((media, i) => (
                                media.type === 'image' ? (
                                    <img key={i} src={media.url} alt="uploaded" className="mt-2 max-w-[60%] rounded-md shadow" />
                                ) : (
                                    <video key={i} src={media.url} controls className="mt-2 max-w-[60%] rounded-md shadow" />
                                )
                            ))}
                            <p className="text-xs text-gray-400 mt-1">{msg.timestamp}</p>

                            <button
                                onClick={() => deleteMessage(msg.id)}
                                className="absolute top-0 right-0 p-1 hidden group-hover:block text-red-600 hover:text-red-800"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {previews.length > 0 && (
                    <div className="flex items-start gap-4 flex-wrap bg-gray-300 text-black p-4">
                        {previews.map((preview, idx) => (
                            <div key={idx} className="relative w-24 text-center">
                                {preview.type === 'image' ? (
                                    <img src={preview.url} alt="Preview" className="w-24 h-24 object-cover rounded border mb-1" />
                                ) : (
                                    <video src={preview.url} className="w-24 h-24 object-cover rounded border mb-1" />
                                )}
                                <p className="text-xs break-words max-w-[6rem] truncate">{preview.file.name}</p>
                                <button
                                    onClick={() => setPreviews((prev) => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-1"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}


                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-600 hover:text-black"
                        title="Upload"
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
                    />
                    <input
                        type="text"
                        className="flex-grow bg-white rounded px-3 py-2 text-black"
                        placeholder="Message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="text-blue-600 hover:text-blue-800"
                        title="Send"
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    )
}
