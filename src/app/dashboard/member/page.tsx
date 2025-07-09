'use client'
import { useState, useEffect } from 'react'


export default function MemberDashboard() {

  const [card, setCard] = useState({
    name: '',
    description: '',
    image: '',
  })

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

  useEffect(() => {
    const cardData = localStorage.getItem('memberCard')
    const profileData = localStorage.getItem('memberProfile')
    if (cardData) setCard(JSON.parse(cardData))
    if (profileData) setProfile(JSON.parse(profileData))
  }, [])

  const toBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      callback(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Save handlers
  const saveCard = () => {
    localStorage.setItem('memberCard', JSON.stringify(card))
    alert('Business card saved!')
  }

  const saveProfile = () => {
    localStorage.setItem('memberProfile', JSON.stringify(profile))
    alert('Business profile saved!')
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-b from-black via-red-950 to-black text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Member Business Dashboard</h1>

      {/* BUSINESS CARD */}
      <section className="bg-stone-800 p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Business Card</h2>

        <input
          type="text"
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e.target.value })}
          placeholder="Business Name"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <textarea
          value={card.description}
          onChange={(e) => setCard({ ...card, description: e.target.value })}
          placeholder="Business Description"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) toBase64(file, (base64) => setCard({ ...card, image: base64 }))
          }}
          className="mb-3"
        />
        {card.image && (
          <img src={card.image} className="w-full max-w-sm rounded mb-2" alt="Business Cover" />
        )}

        <button onClick={saveCard} className="bg-white text-black px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Save Card
        </button>
      </section>

      {/* PROFILE BUSINESS */}
      <section className="bg-stone-800 p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Business Profile</h2>

        {/* Cover Image */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) toBase64(file, (base64) => setProfile({ ...profile, coverImage: base64 }))
          }}
          className="mb-3"
        />
        {profile.coverImage && (
          <img src={profile.coverImage} className="w-full max-w-sm rounded mb-2" alt="Cover" />
        )}

        {/* Description */}
        <textarea
          value={profile.description}
          onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          placeholder="Business Profile Description"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />

        {/* Slideshow Images */}
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

        {/* Contact & Sosmed */}
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

        {/* Maps */}
        <textarea
          value={profile.maps}
          onChange={(e) => setProfile({ ...profile, maps: e.target.value })}
          placeholder="Embed map iframe"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />

        <button onClick={saveProfile} className="bg-white text-black px-4 py-2 rounded hover:bg-red-600 hover:text-white transition">
          Save Profile
        </button>
      </section>
    </div>
  )
}
