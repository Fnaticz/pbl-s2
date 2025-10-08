'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  FaSignOutAlt,
  FaFileInvoiceDollar,
  FaTimes,
  FaBars,
  FaUser,
  FaClipboardList,
  FaMoneyBill
} from 'react-icons/fa'
import Image from "next/image";
import Loading from '../../components/Loading';
import type { IVoucher } from "../../../../models/voucher";

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const [loadingPage, setLoadingPage] = useState(true)
  const [activeTab, setActiveTab] = useState('stats')
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
  const [businesses, setBusinesses] = useState<typeof emptyProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ totalEvents: 0, totalBusinesses: 0, totalPoints: 0 })

  type HistoryEvent = {
    eventName: string
    date: string
    pointsEarned: number
  }
  const [history, setHistory] = useState<HistoryEvent[]>([])

  const [selectedBusiness, setSelectedBusiness] = useState<string>("")
  const [vouchers, setVouchers] = useState<IVoucher[]>([])
  const [editingVoucher, setEditingVoucher] = useState<IVoucher | null>(null)

  const [voucherForm, setVoucherForm] = useState({
    title: "",
    description: "",
    pointsRequired: 0,
    expiryDate: "",
    stock: 0,
  })

  type RedeemedVoucher = {
    id: string
    voucherTitle: string
    businessName: string
    pointsUsed: number
    redeemedAt: string
    expiryDate: string | null
    status: string
  }
  const [redeemed, setRedeemed] = useState<RedeemedVoucher[]>([])

  // === Fetch Redeemed Vouchers ===
  const loadRedeemed = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/member/voucher-redemption?userId=${user.id}`)
      const data = await res.json()
      setRedeemed(data.redemptions || [])
    } catch (err) {
      console.error("Failed loading redeemed", err)
    }
  }, [user?.id])

  useEffect(() => {
    loadRedeemed()
  }, [loadRedeemed])

  // === Fetch Stats ===
  useEffect(() => {
    if (!user?.id) return
    const fetchStats = async () => {
      const res = await fetch(`/api/members/dashboard-stats?userId=${user.id}&username=${user.username}`)
      const data = await res.json()
      setStats(data)
    }
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [user?.id, user?.username])

  // === Fetch History ===
  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/members/dashboard-history?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setHistory(data.events || []))
      .catch((err) => console.error("History fetch failed", err))
  }, [user?.id])

  // === Fetch Business List ===
  useEffect(() => {
    if (!user?.id) return
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/business?userId=${user.id}`)
        if (!res.ok) return
        const data = await res.json()
        setBusinesses(data || [])
      } catch (err) {
        console.error('Failed to load businesses', err)
      }
    }
    fetchBusiness()
  }, [user?.id])

  // === Fetch Vouchers by Business ===
  useEffect(() => {
    if (!selectedBusiness) return
    const fetchVouchers = async () => {
      try {
        const res = await fetch(`/api/voucher/index?businessId=${selectedBusiness}`)
        const data = await res.json()
        setVouchers(data || [])
      } catch (err) {
        console.error('Failed to load vouchers', err)
      }
    }
    fetchVouchers()
  }, [selectedBusiness])

  // === Loading Simulate ===
  useEffect(() => {
    const timer = setTimeout(() => setLoadingPage(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // === Helper to Base64 ===
  const toBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => callback(reader.result as string)
    reader.readAsDataURL(file)
  }

  // === Handle Business Save ===
  const handleSaveProfile = async () => {
    if (!user?.id) return alert('Login required')

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
      alert('Please fill all required fields!')
      return
    }

    setLoading(true)
    try {
      const method = profile._id ? 'PUT' : 'POST'
      const res = await fetch('/api/business', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, userId: user.id }),
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

  // === Delete Business ===
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

  // === Add Voucher ===
  const handleAddVoucher = async () => {
    if (!selectedBusiness) return alert('Select a business first!')
    if (!voucherForm.title.trim()) return alert('Title required!')
    try {
      const res = await fetch('/api/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...voucherForm, businessId: selectedBusiness }),
      })
      const data = await res.json()
      if (res.ok) {
        alert('Voucher added!')
        setVoucherForm({ title: '', description: '', pointsRequired: 0, expiryDate: '', stock: 0 })
        setVouchers((prev) => [...prev, data.voucher])
      } else {
        alert(data.message || 'Failed to add voucher')
      }
    } catch (err) {
      console.error(err)
      alert('Server error')
    }
  }

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('Delete this voucher?')) return
    try {
      await fetch(`/api/voucher?id=${id}`, { method: 'DELETE' })
      setVouchers((prev) => prev.filter((v) => v._id !== id))
    } catch (err) {
      console.error('Failed to delete voucher', err)
    }
  }

  if (status === 'loading') return <p className="text-white">Loading session...</p>
  if (!user) return <p className="text-white">You must be logged in</p>
  if (loadingPage) return <Loading />

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black to-red-950 text-white">
      <aside className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 h-screen flex-col`}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <span className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>Member Dashboard</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {['stats', 'history', 'vouchers', 'business'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === tab ? 'bg-red-600' : 'bg-gray-800 hover:bg-red-500'}`}
            >
              {tab === 'stats' && <FaUser />}
              {tab === 'history' && <FaClipboardList />}
              {tab === 'vouchers' && <FaMoneyBill />}
              {tab === 'business' && <FaFileInvoiceDollar />}
              {sidebarOpen && tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-red-600"
          >
            <FaSignOutAlt /> {sidebarOpen && 'Leave Dashboard'}
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-6 bg-gray-900 rounded-tl-xl">
        <h1 className="text-2xl font-bold mb-6 capitalize">{activeTab}</h1>
        {/* TODO: renderSection() dapat dipisah menjadi komponen */}
        <div className="text-gray-300">Tab content coming here...</div>
      </main>
    </div>
  )
}
