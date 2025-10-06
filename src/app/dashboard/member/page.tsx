'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { FaSignOutAlt, FaFileInvoiceDollar, FaTimes, FaBars, FaUser, FaClipboardList, FaMoneyBill } from 'react-icons/fa'
import Image from "next/image";
import Loading from '../../components/Loading';
import { IVoucher } from "../../../models/voucher";

export default function MemberDashboard() {
  const [loadingpage, setLoadingPage] = useState(true)
  const { data: session, status } = useSession()
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
    eventName: string;
    date: string;
    pointsEarned: number;
    // add other fields if needed
  };
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [voucher, setVoucher] = useState<IVoucher[]>([]);
  const [voucherForm, setVoucherForm] = useState({
    title: "",
    description: "",
    pointsRequired: 0,
    expiryDate: "",
    stock: 0,
  });

  type RedeemedVoucher = {
    id: string;
    voucherTitle: string;
    businessName: string;
    pointsUsed: number;
    redeemedAt: string;
    expiryDate: string | null;
    status: string;
    // add other fields if needed
  };
  const [redeemed, setRedeemed] = useState<RedeemedVoucher[]>([]);

  const loadRedeemed = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/member/voucher-redemption?userId=${user.id}`);
      const data = await res.json();
      setRedeemed(data.redemptions || []);
    } catch (err) {
      console.error("Failed loading redeemed", err);
    }
  }, [user?.id]);

  // panggil loadRedeemed() saat mount (ganti useEffect yang lama)
  useEffect(() => {
    loadRedeemed();
  }, [user, loadRedeemed]);

  const handleRedeem = async (voucherId: string, pointsRequired: number) => {
    if (!confirm(`Redeem this voucher for ${pointsRequired} points?`)) return;
    if (!user?.id) return alert("Login required");

    try {
      const res = await fetch("/api/voucher/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, voucherId }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Voucher redeemed!");
        // refresh redeemed list dan juga update vouchers/stats kalau perlu
        await loadRedeemed();
        // optional: if currently viewing vouchers of the business, refresh that list too
        if (selectedBusiness) {
          const r = await fetch(`/api/voucher/index?businessId=${selectedBusiness}`);
          const d = await r.json();
          setVoucher(d || []);
        }
      } else {
        alert(result.message || "Failed to redeem");
      }
    } catch (err) {
      console.error("Redeem error:", err);
      alert("3 Server error");
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/members/dashboard-voucher?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setVoucher(data.vouchers || []))
      .catch((err) => console.error("Vouchers fetch failed", err));
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/members/dashboard-history?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setHistory(data.events || []))
      .catch((err) => console.error("History fetch failed", err));
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      const res = await fetch(`/api/members/dashboard-stats?userId=${user.id}&username=${user.username}`);
      const data = await res.json();
      setStats(data);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // refresh setiap 5 detik
    return () => clearInterval(interval);
  }, [user]);


  useEffect(() => {
    const timer = setTimeout(() => setLoadingPage(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);


  const [editingVoucher, setEditingVoucher] = useState<IVoucher | null>(null);

  const loadVouchers = useCallback(async () => {
    const res = await fetch("/api/voucher");
    const data = await res.json();
    const merged = data.map((v: IVoucher) => {
      const b = businesses.find((bus) => bus._id === v.businessId);
      return { ...v, businessName: b?.name || "Unknown" };
    });
    setVoucher(merged);
  }, [businesses]);

  const handleEditVoucher = (voucher: IVoucher) => {
    setEditingVoucher(voucher);
  };

  const handleUpdateVoucher = async () => {
    const res = await fetch("/api/voucher", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingVoucher),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Voucher updated!");
      setEditingVoucher(null);
      loadVouchers();
    } else {
      alert(data.message || "Failed to update voucher");
    }
  };

  useEffect(() => {
    if (businesses.length > 0) loadVouchers();
  }, [businesses, loadVouchers]);

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
  }, [user])

  useEffect(() => {
    if (!selectedBusiness) return
    const fetchVouchers = async () => {
      try {
        const res = await fetch(`/api/voucher/index?businessId=${selectedBusiness}`)
        const data = await res.json()
        setVoucher(data || [])
      } catch (err) {
        console.error('Failed to load vouchers', err)
      }
    }
    fetchVouchers()
  }, [selectedBusiness])

  const toBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => callback(reader.result as string)
    reader.readAsDataURL(file)
  }

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
      alert('Please fill all required fields!');
      return;
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
        setVoucherForm({
          title: '',
          description: '',
          pointsRequired: 0,
          expiryDate: '',
          stock: 0,
        })
        setVoucher((prev) => [...prev, data.voucher])
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
      setVoucher((prev) => prev.filter((v) => v._id !== id))
    } catch (err) {
      console.error('Failed to delete voucher', err)
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
      case 'stats':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Member Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow text-center">
                <h3 className="text-lg font-semibold mb-2">Total Event Participation</h3>
                <p className="text-3xl font-bold">{stats.totalEvents}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow text-center">
                <h3 className="text-lg font-semibold mb-2">Total Businesses</h3>
                <p className="text-3xl font-bold">{stats.totalBusinesses}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow text-center">
                <h3 className="text-lg font-semibold mb-2">Total Points</h3>
                <p className="text-3xl font-bold text-yellow-400"> ⭐ {stats.totalPoints}</p>
              </div>
            </div>
          </div>
        )

      case 'history':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Event History</h2>
            <table className="min-w-full border border-gray-700 text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-2 border border-gray-700">Event</th>
                  <th className="p-2 border border-gray-700">Date</th>
                  <th className="p-2 border border-gray-700">Points</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="p-2 border border-gray-700">{h.eventName}</td>
                    <td className="p-2 border border-gray-700">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="p-2 border border-gray-700 text-yellow-400">{h.pointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'vouchers':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Available Vouchers</h2>

            {voucher.length === 0 ? (
              <p>No vouchers available.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {voucher.map((v, index) => (
                  <li key={index} className="bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="font-semibold mb-1">{v.title}</h3>
                    <p className="text-sm text-gray-300 mb-1">{v.description}</p>
                    <p className="text-yellow-400 text-sm mb-2">{v.pointsRequired} pts</p>
                    <button
                      onClick={() => handleRedeem(v._id, v.pointsRequired)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded mt-2"
                    >
                      Redeem
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <h2 className="text-xl font-bold mb-4 mt-10 text-white border-b border-gray-500 pb-2">
              Redeemed History
            </h2>

            <section className="bg-gray-700/60 p-6 rounded-xl shadow-inner text-gray-100">
              {redeemed.length === 0 ? (
                <p className="text-gray-400 italic">No vouchers redeemed yet.</p>
              ) : (
                <div className="space-y-4">
                  {redeemed.map((r) => (
                    <div
                      key={r.id}
                      className="bg-gray-900/60 p-4 rounded-lg border border-gray-700 hover:border-red-500 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-blue-400">
                          {r.voucherTitle}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide
                ${r.status === "active"
                              ? "bg-green-700 text-green-200"
                              : r.status === "expired"
                                ? "bg-red-700 text-red-200"
                                : "bg-gray-700 text-gray-300"
                            }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-gray-400">Business:</span>{" "}
                        {r.businessName}
                      </p>

                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-400">
                        <p>
                          <span className="font-medium text-gray-500">Points Used:</span>{" "}
                          <span className="text-yellow-400 font-semibold">
                            {r.pointsUsed}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium text-gray-500">Redeemed:</span>{" "}
                          {new Date(r.redeemedAt).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium text-gray-500">Expiry:</span>{" "}
                          {r.expiryDate
                            ? new Date(r.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )




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

                {/* ---------- Add Voucher by Business ---------- */}
                <hr className="my-6 border-gray-700" />
                <h2 className="text-xl font-semibold mb-3">Add Voucher by Business</h2>
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="bg-gray-700 p-2 rounded mb-3 w-full"
                >
                  <option value="">-- Select Business --</option>
                  {businesses.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                {selectedBusiness && (
                  <div className="bg-gray-900 p-4 rounded-lg mb-3">
                    <input
                      type="text"
                      placeholder="Voucher Title"
                      value={voucherForm.title}
                      onChange={(e) =>
                        setVoucherForm({ ...voucherForm, title: e.target.value })
                      }
                      className="bg-gray-700 p-2 rounded w-full mb-2"
                    />
                    <textarea
                      placeholder="Description"
                      value={voucherForm.description}
                      onChange={(e) =>
                        setVoucherForm({ ...voucherForm, description: e.target.value })
                      }
                      className="bg-gray-700 p-2 rounded w-full mb-2"
                    />
                    <div className="flex gap-3 mb-2">
                      <input
                        type="number"
                        placeholder="Points Required"
                        value={voucherForm.pointsRequired}
                        onChange={(e) =>
                          setVoucherForm({
                            ...voucherForm,
                            pointsRequired: Number(e.target.value),
                          })
                        }
                        className="bg-gray-700 p-2 rounded w-full"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={voucherForm.stock}
                        onChange={(e) =>
                          setVoucherForm({
                            ...voucherForm,
                            stock: Number(e.target.value),
                          })
                        }
                        className="bg-gray-700 p-2 rounded w-full"
                      />
                    </div>
                    <input
                      type="date"
                      value={voucherForm.expiryDate}
                      onChange={(e) =>
                        setVoucherForm({ ...voucherForm, expiryDate: e.target.value })
                      }
                      className="bg-gray-700 p-2 rounded w-full mb-3"
                    />
                    <button
                      onClick={handleAddVoucher}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Add Voucher
                    </button>
                  </div>
                )}
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

                    {/* --- YOUR VOUCHER BY BUSINESS --- */}
                    <h2 className="text-xl font-semibold mb-5 mt-5">Your Vouchers by Business</h2>
                    {voucher.length === 0 ? (
                      <p className="text-gray-400">No vouchers added yet.</p>
                    ) : (
                      <table className="min-w-full border border-stone-700 text-sm">
                        <thead className="bg-stone-700">
                          <tr>
                            <th className="p-2 border border-stone-600">Business</th>
                            <th className="p-2 border border-stone-600">Voucher Title</th>
                            <th className="p-2 border border-stone-600">Points</th>
                            <th className="p-2 border border-stone-600">Stock</th>
                            <th className="p-2 border border-stone-600">Expiry</th>
                            <th className="p-2 border border-stone-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {voucher.map((v, index) => (
                            <tr key={index}>
                              <td className="p-2 border border-stone-700">
                                {businesses.find((b) => b._id === v.businessId)?.name || '-'}
                              </td>
                              <td className="p-2 border border-stone-700">{v.title}</td>
                              <td className="p-2 border border-stone-700">{v.pointsRequired}</td>
                              <td className="p-2 border border-stone-700">{v.stock}</td>
                              <td className="p-2 border border-stone-700">
                                {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="p-2 border border-stone-700">
                                <button
                                  onClick={() => handleEditVoucher(v)}
                                  className="bg-blue-600 px-2 py-1 rounded text-white mr-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteVoucher(v._id)}
                                  className="bg-red-600 px-2 py-1 rounded text-white mt-2"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {/* Edit Voucher Modal */}
                  {editingVoucher && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Edit Voucher</h3>
                        <input
                          type="text"
                          placeholder="Title"
                          value={editingVoucher.title}
                          onChange={(e) =>
                            setEditingVoucher({ ...editingVoucher, title: e.target.value })
                          }
                          className="bg-gray-700 p-2 w-full rounded mb-2"
                        />
                        <textarea
                          placeholder="Description"
                          value={editingVoucher.description}
                          onChange={(e) =>
                            setEditingVoucher({
                              ...editingVoucher,
                              description: e.target.value,
                            })
                          }
                          className="bg-gray-700 p-2 w-full rounded mb-2"
                        />
                        <input
                          type="number"
                          placeholder="Points"
                          value={editingVoucher.pointsRequired}
                          onChange={(e) =>
                            setEditingVoucher({
                              ...editingVoucher,
                              pointsRequired: Number(e.target.value),
                            })
                          }
                          className="bg-gray-700 p-2 w-full rounded mb-2"
                        />
                        <input
                          type="date"
                          value={editingVoucher.expiryDate?.split("T")[0] || ""}
                          onChange={(e) =>
                            setEditingVoucher({
                              ...editingVoucher,
                              expiryDate: e.target.value,
                            })
                          }
                          className="bg-gray-700 p-2 w-full rounded mb-2"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={editingVoucher.stock}
                          onChange={(e) =>
                            setEditingVoucher({
                              ...editingVoucher,
                              stock: Number(e.target.value),
                            })
                          }
                          className="bg-gray-700 p-2 w-full rounded mb-2"
                        />
                        <div className="flex justify-between mt-3">
                          <button
                            onClick={handleUpdateVoucher}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingVoucher(null)}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
            setActiveTab('stats')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'stats'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaUser />
          {sidebarOpen && 'Stats'}
        </button>

        <button
          onClick={() => {
            setActiveTab('history')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'history'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaClipboardList />
          {sidebarOpen && 'History'}
        </button>

        <button
          onClick={() => {
            setActiveTab('vouchers')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'vouchers'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaMoneyBill />
          {sidebarOpen && 'Vouchers'}
        </button>

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
