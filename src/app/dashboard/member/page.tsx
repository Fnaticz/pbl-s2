'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from "next/image";

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user as {
    id: string
    username: string
    role: string
    emailOrPhone: string
  } | undefined

  const emptyProfile = {
    _id: undefined as string | undefined,
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
  }

  const [profile, setProfile] = useState(emptyProfile)
  const [businesses, setBusinesses] = useState<typeof emptyProfile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.username) return

    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/business?username=${user.username}`)
        if (!res.ok) return
        const data = await res.json()
        setBusinesses(data || [])
      } catch (err) {
        console.error('Failed to load businesses', err)
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
      const method = profile._id ? 'PUT' : 'POST'
      const res = await fetch('/api/business', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, username: user.username }),
      })
      const data = await res.json()

      if (res.ok) {
        if (method === "POST") {
          setBusinesses((prev) => [...prev, data.business])
        } else {
          setBusinesses((prev) =>
            prev.map((b) => (b._id === data.business._id ? data.business : b))
          )
        }
        setProfile(emptyProfile)
      }
      alert(data.message || 'Saved')
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return

    try {
      const res = await fetch(`/api/business?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setBusinesses((prev) => prev.filter((b) => b._id !== id))
      }
      alert(data.message || 'Deleted')
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    }
  }

  if (status === 'loading') {
    return <p className="text-white">Loading session...</p>
  }

  if (!user) {
    return <p className="text-white">You must be logged in</p>
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-b from-black via-red-950 to-black text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Member Business Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FORM SECTION */}
        <section className="bg-stone-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            {profile._id ? "Edit Business" : "Add New Business"}
          </h2>

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
              <Image key={i} src={src} alt={`Slideshow ${i + 1}`} width={96} height={96} className="w-24 h-24 object-cover rounded" />
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
              onClick={() => setProfile(emptyProfile)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Clear
            </button>
          </div>
        </section>
        
        {businesses.length > 0 && (
          <section className="bg-stone-900 p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Your Businesses</h2>
            <table className="w-full border border-stone-700 text-sm">
              <thead>
                <tr className="bg-stone-700">
                  <th className="p-2 border border-stone-600">Name</th>
                  <th className="p-2 border border-stone-600">Category</th>
                  <th className="p-2 border border-stone-600">Phone</th>
                  <th className="p-2 border border-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz) => (
                  <tr key={biz._id}>
                    <td className="p-2 border border-stone-700">{biz.name}</td>
                    <td className="p-2 border border-stone-700">{biz.category}</td>
                    <td className="p-2 border border-stone-700">{biz.phone}</td>
                    <td className="p-2 border border-stone-700">
                      <button
                        onClick={() => setProfile(biz)}
                        className="bg-blue-600 px-2 py-1 rounded text-white mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(biz._id!)}
                        className="bg-red-600 px-2 py-1 rounded text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  )
}
