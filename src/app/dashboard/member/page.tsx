'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function MemberDashboard() {
  const { data: session } = useSession()
  const user = session?.user as { username: string; email: string } | undefined

  const [profile, setProfile] = useState({
    coverImage: '',
    description: '',
    slideshow: [] as string[],
    contact: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    maps: '',
  })

  const toBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => callback(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!user) return alert('Login required')
    const res = await fetch('/api/save-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, username: user.username }),
    })
    const data = await res.json()
    alert(data.message || 'Profile saved')
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-b from-black via-red-950 to-black text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Member Business Dashboard</h1>

      <section className="bg-stone-800 p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Business Profile</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) toBase64(file, (base64) => setProfile({ ...profile, coverImage: base64 }))
          }}
          className="mb-3"
        />
        {profile.coverImage && <img src={profile.coverImage} className="w-full max-w-sm rounded mb-2" alt="Cover" />}
        <textarea
          value={profile.description}
          onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          placeholder="Business Profile Description"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <label className="block mb-1 text-sm font-medium">Slideshow Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = e.target.files
            if (files) {
              Array.from(files).forEach((file) => {
                toBase64(file, (base64) => {
                  setProfile((prev) => ({ ...prev, slideshow: [...prev.slideshow, base64] }))
                })
              })
            }
          }}
          className="mb-3"
        />
        <div className="flex gap-2 flex-wrap mb-3">
          {profile.slideshow.map((src, i) => (
            <img key={i} src={src} className="w-24 h-24 object-cover rounded" />
          ))}
        </div>
        <input
          value={profile.contact}
          onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
          placeholder="Contact (e.g., WhatsApp link)"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <input
          value={profile.facebook}
          onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
          placeholder="Facebook URL"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <input
          value={profile.instagram}
          onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
          placeholder="Instagram URL"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <input
          value={profile.whatsapp}
          onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
          placeholder="WhatsApp URL"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <textarea
          value={profile.maps}
          onChange={(e) => setProfile({ ...profile, maps: e.target.value })}
          placeholder="Embed map iframe"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <button onClick={handleSaveProfile} className="bg-white text-black px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">Save Profile</button>
      </section>
    </div>
  )
}
