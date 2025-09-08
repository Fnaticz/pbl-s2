'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user as {
    id: string
    username: string
    role: string
    emailOrPhone: string
  } | undefined

  const [profile, setProfile] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    facebook: '',
    instagram: '',
    whatsapp: '',
    maps: '',
    slideshow: [] as string[],
  })

  const [loading, setLoading] = useState(false)
  const [hasBusiness, setHasBusiness] = useState(false)

  useEffect(() => {
    if (!user?.username) return

    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/business?username=${user.username}`)
        if (!res.ok) return
        const data = await res.json()
        if (data && data.username) {
          setProfile({
            name: data.name || '',
            category: data.category || '',
            description: data.description || '',
            address: data.address || '',
            phone: data.phone || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            whatsapp: data.whatsapp || '',
            maps: data.maps || '',
            slideshow: data.slideshow || [],
          })
          setHasBusiness(true)
        }
      } catch (err) {
        console.error('Failed to load business', err)
      }
    }

    fetchBusiness()
  }, [user])

  const toBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => callback(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!user?.username) return alert('Login required')
  
    setLoading(true)
    try {
      const method = hasBusiness ? 'PUT' : 'POST'
      const res = await fetch('/api/business', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, username: user.username }),
      })
      const data = await res.json()
      if (res.ok) {
        setHasBusiness(true)
      }
      alert(data.message || 'Saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm('Are you sure you want to delete your business?')) return

    try {
      const res = await fetch(`/api/business?username=${user.username}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      alert(data.message || 'Deleted')
      setProfile({
        name: '',
        category: '',
        description: '',
        address: '',
        phone: '',
        facebook: '',
        instagram: '',
        whatsapp: '',
        maps: '',
        slideshow: [],
      })
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    }
  }

  // Loading session
  if (status === 'loading') {
    return <p className="text-white">Loading session...</p>
  }

  // Belum login
  if (!user) {
    return <p className="text-white">You must be logged in</p>
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-b from-black via-red-950 to-black text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Member Business Dashboard</h1>

      <section className="bg-stone-800 p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Business Profile</h2>

        <input
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="Business Name"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <input
          value={profile.category}
          onChange={(e) => setProfile({ ...profile, category: e.target.value })}
          placeholder="Category"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <textarea
          value={profile.description}
          onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          placeholder="Business Profile Description"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <input
          value={profile.address}
          onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          placeholder="Address"
          className="w-full p-2 mb-3 bg-white/20 rounded text-white"
        />
        <input
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          placeholder="Phone"
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

        <div className="flex gap-4">
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-white text-black px-4 py-2 rounded hover:bg-red-600 hover:text-white transition"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 transition"
          >
            Delete
          </button>
        </div>
      </section>
    </div>
  )
}
