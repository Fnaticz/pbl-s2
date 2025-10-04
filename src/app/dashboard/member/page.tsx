'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ReactNode } from "react";
import { FaSignOutAlt, FaFileInvoiceDollar, FaTimes, FaBars, FaUser, FaClipboardList, FaImages, FaMoneyBill, FaCalendarAlt, FaList, FaTrash, FaPlus } from 'react-icons/fa'
import Link from "next/link";
import Image from "next/image";
import Loading from '../../components/Loading';

export default function MemberDashboard() {
  const [loadingpage, setLoadingPage] = useState(true);
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('business')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebar, setMobileSidebar] = useState(false)
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
  const [businessImages, setBusinessImages] = useState<string[]>([])
  const [businesses, setBusinesses] = useState<typeof emptyProfile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoadingPage(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);

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

    if (
      !profile.name.trim() ||
      !profile.category.trim() ||
      !profile.description.trim() ||
      !profile.address.trim() ||
      !profile.phone.trim() ||
      !profile.facebook.trim() ||
      !profile.instagram.trim() ||
      !profile.whatsapp.trim() ||
      !profile.maps.trim() 
    ) {
      alert('Please fill all required fields!');
      return;
    }

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

  if (loadingpage) return <Loading />;

  const renderSection = () => {
    switch (activeTab) {
      case 'business':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Member Business</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FORM SECTION */}
              <section className="bg-gray-800 p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4">
                  {profile._id ? "Edit Business" : "Add New Business"}
                </h2>

                {/* Business Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Business Name</label>
                  <textarea
                    placeholder="Business Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Business Category</label>
                  <textarea
                    placeholder="Category"
                    value={profile.category}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Business Description</label>
                  <textarea
                    placeholder="Description"
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Business Address</label>
                  <textarea
                    placeholder="Address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Phone Number</label>
                  <textarea
                    placeholder="Phone Number"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Images */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Slideshow Business Images</label>
                  <label
                    htmlFor="business-files"
                    className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow inline-block"
                  >
                    Choose Pictures
                  </label>
                  <input
                    id="business-files"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        Array.from(files).forEach((file) => {
                          toBase64(file, (base64) => {
                            setProfile((prev) => ({ ...prev, slideshow: [...prev.slideshow, base64] }))
                          })
                        });
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>

                {businesses.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-4">
                    {profile.slideshow.map((src, i) => (
                      <div key={i} className="relative">
                        <Image
                          src={src}
                          alt={`Slideshow ${i + 1}`}
                          width={300}
                          height={300}
                          unoptimized
                          className="w-full max-w-md rounded mb-2 shadow"
                        />
                        <button
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              slideshow: prev.slideshow.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="mt-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* FB */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Facebook URL</label>
                  <textarea
                    placeholder="Facebook Link"
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* IG */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Instagram URL</label>
                  <textarea
                    placeholder="Instagram Link"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* WA */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">WhatsApp URL</label>
                  <textarea
                    placeholder="WhatsApp Link"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                {/* Maps */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">Embed Google Maps Iframe</label>
                  <textarea
                    placeholder="Embed GMaps Iframe"
                    value={profile.maps}
                    onChange={(e) => setProfile({ ...profile, maps: e.target.value })}
                    className="bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setProfile(emptyProfile)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
                  >
                    Clear
                  </button>
                </div>
              </section>

              {businesses.length > 0 && (
                <section className="bg-gray-800 p-6 rounded-xl shadow">
                  <h2 className="text-xl font-semibold mb-4">Your Businesses</h2>
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-full border border-stone-700 text-sm">
                      <thead>
                        <tr className="bg-stone-700">
                          <th className="p-2 border border-stone-600 max-w-[150px]">Name</th>
                          <th className="p-2 border border-stone-600 max-w-[120px]">Category</th>
                          <th className="p-2 border border-stone-600 max-w-[120px]">Phone</th>
                          <th className="p-2 border border-stone-600 max-w-[120px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businesses.map((biz) => (
                          <tr key={biz._id}>
                            <td className="p-2 border border-stone-700 max-w-[150px] break-words whitespace-pre-line">{biz.name}</td>
                            <td className="p-2 border border-stone-700 max-w-[120px] break-words whitespace-pre-line">{biz.category}</td>
                            <td className="p-2 border border-stone-700 max-w-[120px] break-words whitespace-pre-line">{biz.phone}</td>
                            <td className="p-2 border border-stone-700 max-w-[120px]">
                              <button
                                onClick={() => setProfile(biz)}
                                className="bg-blue-600 px-2 py-1 rounded text-white mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(biz._id!)}
                                className="bg-red-600 px-2 py-1 rounded text-white mt-2"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
              }
            </div >
          </div >
        )
    }
  }
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>
          Member Dashboard
        </span>
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

      {/* Menu scrollable */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        <button
          onClick={() => {
            setActiveTab('business')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'business'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaFileInvoiceDollar />
          {sidebarOpen && 'Business'}
        </button>
      </div>
      {/* Leave Dashboard button at the bottom */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-red-600 text-white font-semibold"
        >
          <FaSignOutAlt />
          {sidebarOpen && 'Leave Dashboard'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black to-red-950 to-black text-white">
      {/* Sidebar Dekstop*/}
      <aside
        className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'
          } bg-gray-900 h-screen flex flex-col transition-all duration-300`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile - popup overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="absolute left-0 top-0 w-64 h-full bg-gray-900 z-50">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content dengan scroll terpisah */}
      <main className="flex-1 h-screen overflow-y-auto p-6 relative">
        <h1 className="absolute top-4 right-4 text-white md:hidden text-lg font-semibold mb-2">Member Dashboard</h1>
        {/* Tombol hamburger muncul hanya di mobile */}
        <button
          onClick={() => setMobileSidebar(true)}
          className="absolute top-4 left-4 text-white md:hidden"
        >
          <FaBars size={24} />
        </button>
        <div className="bg-gray-900 p-6 rounded shadow min-h-full mt-10 md:mt-0">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}
