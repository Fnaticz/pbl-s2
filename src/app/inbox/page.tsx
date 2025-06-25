'use client'

import { useEffect, useState } from 'react'

type Message = {
  _id: string;
  from: string;
  to: string;
  type: 'admin' | 'tag';
  content: string;
  date: string;
};

export default function InboxPage() {
<<<<<<< HEAD
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPopup, setShowPopup] = useState<{
    visible: boolean;
    message: string;
    type: 'approved' | 'rejected' | null;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/inbox');
        const data = await res.json();
        const filtered = data.filter((msg: Message) => msg.to === currentUser.username);
        setMessages(filtered);
      } catch (err) {
        console.error("Failed to fetch inbox messages:", err);
      }
    };

    fetchMessages();
  }, [currentUser]);

  const playSound = (approved: boolean) => {
    const audio = new Audio(approved ? '/sounds/success.mp3' : '/sounds/fail.mp3');
    audio.play();
  };

  const handleAccept = async (id: string) => {
    const msg = messages.find(m => m._id === id);
    if (!msg) return;

    const isApproved = msg.content.toLowerCase().includes('approved');
    const username = msg.content.split(',')[1]?.split('!')[0]?.trim() || 'Member';
    const resultMsg = isApproved ? `Welcome, ${username}!` : `Sorry, ${username}!`;

    setShowPopup({
      visible: true,
      message: resultMsg,
      type: isApproved ? 'approved' : 'rejected'
    });

    playSound(isApproved);

    await fetch('/api/inbox', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setMessages(prev => prev.filter(m => m._id !== id));
    setTimeout(() => setShowPopup(null), 3000);
  };

  if (!currentUser) return <p className="text-white text-center pt-32">Loading user...</p>;
=======
    const [messages, setMessages] = useState<{ from: string; type: 'admin' | 'tag'; content: string; message: string; date: string }[]>([])
    const [showPopup, setShowPopup] = useState<{ visible: boolean; message: string; type: 'approved' | 'rejected' | null } | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('inboxMessages')
        if (stored) setMessages(JSON.parse(stored))
    }, [])

    const playSound = (approved: boolean) => {
        const audio = new Audio(approved ? '/sounds/success.mp3' : '/sounds/fail.mp3')
        audio.play()
    }

    const handleAccept = (index: number) => {
        const msg = messages[index]
        const isApproved = msg.content.toLowerCase().includes('approved')
        const username = msg.content.split(',')[1]?.split('!')[0]?.trim() || 'Member'
        const resultMsg = isApproved ? `Welcome, ${username}!` : `Sorry, ${username}!`
        setShowPopup({ visible: true, message: resultMsg, type: isApproved ? 'approved' : 'rejected' })
        playSound(isApproved)

        const updated = messages.filter((_, i) => i !== index)
        setMessages(updated)
        localStorage.setItem('inboxMessages', JSON.stringify(updated))

        setTimeout(() => setShowPopup(null), 3000)
    }
>>>>>>> 08c1a76ca121adaf5e85faf777c0d089f987fa77

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10 relative">
            <main className="flex-grow pt-20 px-4 pb-16">
                <h1 className="text-3xl font-bold mb-6 text-center">Inbox Notifications</h1>

<<<<<<< HEAD
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((msg) => (
              <li key={msg._id} className="bg-gray-800 p-4 rounded shadow">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-red-400">
                    {msg.type === 'admin' ? 'Admin' : 'Tag Mention'}
                  </span>
                  <span className="text-xs text-gray-400">{msg.date}</span>
                </div>
                <p className="text-white mb-1">{msg.content}</p>
                <p className="text-sm text-gray-400 mb-2">From: {msg.from}</p>
                {msg.type === 'admin' && (
                  <button
                    onClick={() => handleAccept(msg._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                  >
                    Accept
                  </button>
=======
                {messages.length === 0 ? (
                    <p className="text-center text-gray-400">No messages yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {messages.map((msg, index) => (
                            <li key={index} className="bg-gray-800 p-4 rounded shadow">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-semibold text-red-400">{msg.type === 'admin' ? 'Admin' : 'Tag Mention'}</span>
                                    <span className="text-xs text-gray-400">{msg.date}</span>
                                </div>
                                <p className="text-white mb-1">{msg.content}</p>
                                <p className="text-white mb-1">{msg.message}</p>
                                <p className="text-sm text-gray-400 mb-2">From: {msg.from}</p>
                                {msg.type === 'tag' && (
                                    <button
                                        onClick={() => {
                                            const updated = messages.filter((_, i) => i !== index)
                                            setMessages(updated)
                                            localStorage.setItem('inboxMessages', JSON.stringify(updated))
                                        }}
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm mt-2"
                                    >
                                        Clear
                                    </button>
                                )}

                                {msg.type === 'admin' && (
                                    <button
                                        onClick={() => handleAccept(index)}
                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                                    >
                                        Accept
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
>>>>>>> 08c1a76ca121adaf5e85faf777c0d089f987fa77
                )}
            </main>

            {showPopup?.visible && (
                <>
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white text-black px-6 py-4 rounded shadow-lg text-xl font-semibold animate-bounce">
                            {showPopup.message}
                        </div>
                    </div>
                    {[...Array(25)].map((_, i) => (
                        <div
                            key={i}
                            className="fixed text-3xl z-40 pointer-events-none animate-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 100}px`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            {showPopup.type === 'approved' ? '😊' : '😢'}
                        </div>
                    ))}
                    <style>{`
            @keyframes fall {
              0% { transform: translateY(0); opacity: 1; }
              100% { transform: translateY(100vh); opacity: 0; }
            }
            .animate-fall {
              animation-name: fall;
              animation-timing-function: linear;
              position: fixed;
            }
          `}</style>
<<<<<<< HEAD
        </>
      )}
    </div>
  );
=======
                </>
            )}
        </div>
    )
>>>>>>> 08c1a76ca121adaf5e85faf777c0d089f987fa77
}
