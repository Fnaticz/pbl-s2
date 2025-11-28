'use client'

import { useEffect, useState } from 'react'
import type { IBanner } from '../../../../models/banner';
import { FaClipboardCheck, FaTruckMonster, FaSignOutAlt, FaTimes, FaBars, FaUser, FaClipboardList, FaImages, FaMoneyBill, FaCalendarAlt, FaList, FaTrash, FaPlus } from 'react-icons/fa'
import { useSession } from 'next-auth/react';
import autoTable from 'jspdf-autotable'
import jsPDF from 'jspdf'
import Image from "next/image";
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import Confirm from '../../components/Confirm';
import { motion, AnimatePresence } from 'framer-motion';
import { IMainEvent } from '../../../../models/main-event';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';


export default function AdminDashboard() {
  const [mobileSidebar, setMobileSidebar] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats')
  const [members, setMembers] = useState<{
    _id: string;
    username: string;
    emailOrPhone: string;
    date: string;
  }[]>([])
  const [participant, setParticipants] = useState<{
    _id: string;
    username: string;
    emailOrPhone: string;
    driverName: string;
    coDriverName: string;
    driverPhone: string;
    coDriverPhone: string;
    date: string;
  }[]>([])
  const [pendingMember, setPendingMember] = useState<{
    _id: string;
    username: string;
    emailOrPhone: string;
    name: string;
    address: string;
    phone: string;
    hobby: string;
    vehicleType: string;
    vehicleSpec: string;
    message: string;
  }[]>([])
  const [pendingParticipant, setPendingParticipant] = useState<{
    _id: string;
    username: string;
    emailOrPhone: string;
    driverName: string;
    coDriverName: string;
    carName: string;
    driverPhone: string;
    coDriverPhone: string;
    policeNumber: string;
    address: string;
    teamName: string;
    paymentStatus: string;
    paymentProof?: string;
    message: string;
  }[]>([])
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [bannerName, setBannerName] = useState('')
  const [bannerTitle, setBannerTitle] = useState('')
  const [bannerDate, setBannerDate] = useState('')
  const [bannerLocation, setBannerLocation] = useState('')
  // const [activityPreview, setActivityPreview] = useState<string | null>(null)
  const [mainEventPreview, setMainEventPreview] = useState<string | null>(null)
  const [mainEventName, setMainEventName] = useState('')
  const [mainEventTitle, setMainEventTitle] = useState('')
  const [mainEventDate, setMainEventDate] = useState('')
  const [mainEventLocation, setMainEventLocation] = useState('')
  const [mainEventDesc, setMainEventDesc] = useState('')
  const [mainEventImages, setMainEventImages] = useState<string[]>([])
  const [mainEventReports, setMainEventReports] = useState<IMainEvent[]>([])
  const [activityName, setActivityName] = useState('')
  const [activityTitle, setActivityTitle] = useState('')
  const [activityDesc, setActivityDesc] = useState('')
  const [activityImages, setActivityImages] = useState<string[]>([])
  const [activityReports, setActivityReports] = useState<{ _id: string; title: string; name: string; desc: string; date: string; preview: string; imageUrl: string; images?: string[]; createdAt: Date }[]>([])
  const [financeRecords, setFinanceRecords] = useState<{ _id: string; description: string; amount: number; date: string }[]>([])
  const [totalAmount, setTotalAmount] = useState<number | null>(null)
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, message: '', type: 'info' })
  const [confirm, setConfirm] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({ isOpen: false, message: '', onConfirm: () => {} })
  const [schedules, setSchedules] = useState<{ _id: string; date: string; title: string; created: string }[]>([])
  const [eventDate, setEventDate] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [stats, setStats] = useState({ 
    totalMembers: 0, 
    pendingMembers: 0,
    totalRegisteredMembers: 0,
    totalActiveMembers: 0
  });
  const [bannerReports, setBannerReports] = useState<IBanner[]>([])


  const fetchMembers = async () => {
    const res = await fetch('/api/members/list');
    const data = await res.json();
    setPendingMember(data.pending);
    setMembers(data.approved);
  };

  const fetchEvents = async () => {
    const res = await fetch('/api/events/list');
    const data = await res.json();
    setPendingParticipant(data.pending);
    setParticipants(data.approved);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/members/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const calculateTotal = () => {
    const total = financeRecords.reduce((sum, record) => sum + record.amount, 0)
    setTotalAmount(total)
  }

  const handleAcceptMember = async (id: string) => {
    try {
      const res = await fetch('/api/members/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'accept' })
      });

      const result = await res.json();
      if (res.ok) {
        setPendingMember(prev => prev.filter(m => m._id !== id));
        fetchMembers();
        setAlert({ isOpen: true, message: 'Accepted successfully', type: 'success' })
      } else {
        setAlert({ isOpen: true, message: result.message || 'Failed to accept', type: 'error' })
      }
    } catch (error) {
      console.error(error);
      setAlert({ isOpen: true, message: 'Error accepting application', type: 'error' })
    }
  };

  const handleAcceptParticipant = async (id: string) => {
    try {
      const res = await fetch('/api/events/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'accept' })
      });

      const result = await res.json();
      if (res.ok) {
        setPendingParticipant(prev => prev.filter(m => m._id !== id));
        fetchEvents();
        setAlert({ isOpen: true, message: 'Accepted successfully', type: 'success' })
      } else {
        setAlert({ isOpen: true, message: result.message || 'Failed to accept', type: 'error' })
      }
    } catch (error) {
      console.error(error);
      setAlert({ isOpen: true, message: 'Error accepting application', type: 'error' })
    }
  };

  const handleRejectMember = async (id: string) => {
    try {
      const res = await fetch('/api/members/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' })
      });

      const result = await res.json();
      if (res.ok) {
        setPendingMember(prev => prev.filter(m => m._id !== id));
        setAlert({ isOpen: true, message: 'Rejected successfully', type: 'success' })
      } else {
        setAlert({ isOpen: true, message: result.message || 'Failed to reject', type: 'error' })
      }
    } catch (error) {
      console.error(error);
      setAlert({ isOpen: true, message: 'Error rejecting application', type: 'error' })
    }
  };

  const handleRejectParticipant = async (id: string) => {
    try {
      const res = await fetch('/api/events/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' })
      });

      const result = await res.json();
      if (res.ok) {
        setPendingParticipant(prev => prev.filter(m => m._id !== id));
        setAlert({ isOpen: true, message: 'Rejected successfully', type: 'success' })
      } else {
        setAlert({ isOpen: true, message: result.message || 'Failed to reject', type: 'error' })
      }
    } catch (error) {
      console.error(error);
      setAlert({ isOpen: true, message: 'Error rejecting application', type: 'error' })
    }
  };

  const handleUpload = async () => {
    if (!bannerTitle || !bannerDate || !bannerLocation || !bannerName) {
      setAlert({ isOpen: true, message: "All fields required", type: 'warning' })
      return
    }

    const fileInput = document.getElementById("banner-file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setAlert({ isOpen: true, message: "No file selected", type: 'warning' })
      return
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      try {
        const res = await fetch("/api/banner/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bannerName,
            title: bannerTitle,
            eventDate: bannerDate,
            location: bannerLocation,
            file: base64,
          }),
        });

        if (res.ok) {
          const newBanner = await res.json();
          setBannerReports((prev) => [...prev, newBanner]);

          setAlert({ isOpen: true, message: "Banner uploaded!", type: 'success' })
          setBannerTitle("");
          setBannerDate("");
          setBannerLocation("");
          setBannerName("");
          setBannerPreview(null);
          fileInput.value = "";
        } else {
          setAlert({ isOpen: true, message: "Upload failed", type: 'error' })
        }
      } catch (err) {
        console.error("Upload error:", err);
        setAlert({ isOpen: true, message: "Server error", type: 'error' })
      }
    };

    reader.readAsDataURL(file);
  };



  const handleDelete = async (id: string) => {
    setConfirm({
      isOpen: true,
      message: 'Delete this banner?',
      onConfirm: async () => {
        const res = await fetch('/api/banner/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          setBannerReports(prev => prev.filter(b => b._id !== id));
          setAlert({ isOpen: true, message: 'Banner deleted successfully', type: 'success' })
        } else {
          setAlert({ isOpen: true, message: 'Failed to delete banner', type: 'error' })
        }
        setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
      }
    })
  };

  const handleAddActivity = async () => {
    if (activityImages.length === 0 || !activityTitle || !activityDesc) {
      setAlert({ isOpen: true, message: "All fields required", type: 'warning' })
      return
    }

    setConfirm({
      isOpen: true,
      message: "Add this activity?",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/activity/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: activityTitle,
              name: activityName || "activity",
              desc: activityDesc,
              images: activityImages,
            }),
          });

          if (res.ok) {
            const newActivity = await res.json();
            setActivityReports((prev) => [...prev, newActivity]);

            setAlert({ isOpen: true, message: "Activity uploaded!", type: 'success' })
            setActivityTitle("");
            setActivityName("");
            setActivityDesc("");
            setActivityImages([]);
          } else {
            setAlert({ isOpen: true, message: "Upload failed", type: 'error' })
          }
        } catch (error) {
          console.error("Upload error:", error);
          setAlert({ isOpen: true, message: "Server error", type: 'error' })
        }
        setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
      }
    })
  };

  const handleAddMainEvent = async () => {
    if (!mainEventTitle || !mainEventDate || !mainEventLocation || !mainEventDesc || !mainEventName) {
      setAlert({ isOpen: true, message: "All fields required", type: 'warning' })
      return
    }

    const fileInput = document.getElementById("bannermainevent-file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setAlert({ isOpen: true, message: "No file selected", type: 'warning' })
      return
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      try {
        const res = await fetch("/api/mainevent/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: mainEventName,
            title: mainEventTitle,
            date: mainEventDate,
            location: mainEventLocation,
            desc: mainEventDesc,
            file: base64,
          }),
        });

        if (res.ok) {
          const newMainEvent = await res.json();
          setMainEventReports((prev) => [...prev, newMainEvent]);

          setAlert({ isOpen: true, message: "Main event uploaded!", type: 'success' })
          setMainEventTitle("");
          setMainEventDate("");
          setMainEventLocation("");
          setMainEventDesc("");
          setMainEventName("");
          setMainEventPreview(null);
          fileInput.value = "";
        } else {
          setAlert({ isOpen: true, message: "Upload failed", type: 'error' })
        }
      } catch (err) {
        console.error("Upload error:", err);
        setAlert({ isOpen: true, message: "Server error", type: 'error' })
      }
    };

    reader.readAsDataURL(file);
  };

  const handleViewProof = (base64: string) => {
    const blob = fetch(base64)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      });
  };


  useEffect(() => {
    const fetchMainEvent = async () => {
      const res = await fetch('/api/mainevent');
      const data = await res.json();
      setMainEventReports(data);
    };

    fetchMainEvent();
  }, []);


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banner');
        const data = await res.json();
        setBannerReports(data || []);
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      const res = await fetch('/api/activity');
      const data = await res.json();
      setActivityReports(data);
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      const res = await fetch('/api/finance');
      const data = await res.json();
      setFinanceRecords(data);
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setSchedules(data);
    };
    fetchSchedules();
  }, []);

  const { data: session, status } = useSession();

  if (status === 'loading') return <p className="text-white text-center pt-32">Checking access...</p>;
  if (!session || session.user.role !== 'admin') return <p className="text-white text-center pt-32">Access denied</p>;
  if (loading) return <Loading />;



  const renderSection = () => {
    switch (activeTab) {
      case 'stats': {
        // Data untuk Bar Chart - Semua statistik member
        const barChartData = [
          { name: 'Total Members', value: stats.totalMembers, color: '#2563eb' },
          { name: 'Pending Members', value: stats.pendingMembers, color: '#eab308' },
          { name: 'Member Aktif', value: stats.totalActiveMembers || 0, color: '#16a34a' },
          { name: 'Total Terdaftar', value: stats.totalRegisteredMembers || 0, color: '#9333ea' }
        ];
        
        // Data untuk Pie Chart - Distribusi Member Event (Aktif vs Terdaftar)
        const pieData = [
          { name: 'Member Aktif', value: stats.totalActiveMembers || 0 },
          { name: 'Member Terdaftar (Non-Aktif)', value: Math.max(0, (stats.totalRegisteredMembers || 0) - (stats.totalActiveMembers || 0)) }
        ];
        
        // Data untuk Pie Chart - Status Member (Total vs Pending)
        const statusPieData = [
          { name: 'Approved Members', value: Math.max(0, stats.totalMembers - (stats.pendingMembers || 0)) },
          { name: 'Pending Members', value: stats.pendingMembers || 0 }
        ];
        
        const COLORS = ['#ef4444', '#3b82f6'];
        const STATUS_COLORS = ['#16a34a', '#eab308'];
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard - Statistik Member</h2>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 md:p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform">
                <h3 className="text-xs md:text-sm font-semibold mb-2 text-gray-200">Total Members</h3>
                <p className="text-2xl md:text-4xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-4 md:p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform">
                <h3 className="text-xs md:text-sm font-semibold mb-2 text-gray-200">Pending Members</h3>
                <p className="text-2xl md:text-4xl font-bold text-white">{stats.pendingMembers}</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 md:p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform">
                <h3 className="text-xs md:text-sm font-semibold mb-2 text-gray-200">Member Aktif</h3>
                <p className="text-2xl md:text-4xl font-bold text-white">{stats.totalActiveMembers || 0}</p>
                <p className="text-xs text-gray-300 mt-1">Yang telah mengikuti event</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 md:p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform">
                <h3 className="text-xs md:text-sm font-semibold mb-2 text-gray-200">Total Terdaftar</h3>
                <p className="text-2xl md:text-4xl font-bold text-white">{stats.totalRegisteredMembers || 0}</p>
                <p className="text-xs text-gray-300 mt-1">Yang mendaftar event</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
              {/* Bar Chart - Perbandingan Semua Statistik */}
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-center text-white">Perbandingan Statistik Member</h3>
                <div className="w-full" style={{ minWidth: '280px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={11}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                      <Bar dataKey="value" name="Jumlah" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart - Distribusi Member Event */}
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-center text-white">Distribusi Member Event</h3>
                <div className="w-full" style={{ minWidth: '280px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        fontSize={12}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart - Status Member (Approved vs Pending) */}
              <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg md:text-xl font-bold mb-4 text-center text-white">Status Member (Approved vs Pending)</h3>
                <div className="w-full" style={{ minWidth: '280px' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        fontSize={12}
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )
      }
      case 'members':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Member Registration Management</h2>
            {pendingMember.length > 0 ? (
              pendingMember.map((m) => (
                <div key={m._id} className="bg-gray-700 text-white p-4 rounded shadow mb-4">
                  <p><strong>Username:</strong> {m.username}</p>
                  <p><strong>Email:</strong> {m.emailOrPhone || '-'}</p>
                  <p><strong>Name:</strong> {m.name}</p>
                  <p><strong>Address:</strong> {m.address}</p>
                  <p><strong>Phone:</strong> {m.phone}</p>
                  <p><strong>Hobby:</strong> {m.hobby}</p>
                  <p><strong>Vehicle Type:</strong> {m.vehicleType}</p>
                  <p><strong>Vehicle Spec:</strong> {m.vehicleSpec}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleAcceptMember(m._id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Accept</button>
                    <button onClick={() => handleRejectMember(m._id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 mb-4">No new registration.</p>
            )}

            <h3 className="text-lg font-semibold mb-2">Approved Members</h3>
            {members.map((m) => (
              <div key={m._id} className="bg-gray-700 text-white p-3 mb-2 rounded shadow flex justify-between items-center">
                <div>
                  <p><strong>{m.username}</strong></p>
                  <p className="text-sm text-gray-300">{m.emailOrPhone || '-'}</p>
                  <p className="text-xs text-gray-400">Approved: {m.date}</p>
                </div>
                <button
                  onClick={async () => {
                    setConfirm({
                      isOpen: true,
                      message: "Delete this Member?",
                      onConfirm: async () => {
                        try {
                          const res = await fetch("/api/members/delete", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: m._id }),
                          });

                          const result = await res.json();

                          if (res.ok) {
                            // update state supaya UI langsung refresh
                            setMembers((prev) => prev.filter((act) => act._id !== m._id));
                            setAlert({ isOpen: true, message: "Member deleted successfully", type: 'success' })
                          } else {
                            setAlert({ isOpen: true, message: result.message || "Failed to delete member", type: 'error' })
                          }
                          setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                        } catch (err) {
                          console.error("Delete error:", err);
                          setAlert({ isOpen: true, message: "Server error, please try again.", type: 'error' })
                          setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                        }
                      }
                    })
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )
      case 'event participants':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Event Registration Management</h2>
            {pendingParticipant.length > 0 ? (
              pendingParticipant.map((m) => (
                <div key={m._id} className="bg-gray-700 text-white p-4 rounded shadow mb-4">
                  <p><strong>Username:</strong> {m.username}</p>
                  <p><strong>Email:</strong> {m.emailOrPhone || '-'}</p>
                  <p><strong>Driver Name:</strong> {m.driverName}</p>
                  <p><strong>Co-Driver Name:</strong> {m.coDriverName}</p>
                  <p><strong>Car Name:</strong> {m.carName}</p>
                  <p><strong>Driver Phone:</strong> {m.driverPhone}</p>
                  <p><strong>Co-Driver Phone:</strong> {m.coDriverPhone}</p>
                  <p><strong>Police Number:</strong> {m.policeNumber}</p>
                  <p><strong>Address:</strong> {m.address}</p>
                  <p><strong>Team Name:</strong> {m.teamName}</p>
                  <p><strong>Payment Status:</strong> {m.paymentStatus}</p>
                  {m.paymentProof && (
                    <div className="mt-2">
                      <p className="font-semibold mb-1">Payment Proof:</p>

                      {m.paymentProof.startsWith("data:image") ? (
                        // ✅ jika base64
                        <>
                          <Image
                            src={m.paymentProof}
                            alt="Payment Proof"
                            width={192}
                            height={192}
                            className="rounded-lg border border-gray-600 mb-2 w-48"
                            unoptimized
                          />
                          <button
                            onClick={() => {
                              const newTab = window.open();
                              if (newTab) {
                                newTab.document.write(
                                  `<img src="${m.paymentProof}" style="max-width:100%;height:auto;" />`
                                );
                              }
                            }}
                            className="text-blue-400 underline text-sm"
                          >
                            Open full image
                          </button>
                        </>
                      ) : (
                        // ⚙️ fallback kalau masih berupa URL (file path)
                        <Image
                          src={m.paymentProof}
                          alt="Payment Proof"
                          width={200}
                          height={200}
                          unoptimized
                          className="rounded-lg border border-gray-600 mb-2"
                          onError={(e) => {
                            console.error("Image load error:", m.paymentProof);
                          }}
                        />
                      )}
                    </div>
                  )}





                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleAcceptParticipant(m._id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Accept</button>
                    <button onClick={() => handleRejectParticipant(m._id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 mb-4">No new registration.</p>
            )}

            <h3 className="text-lg font-semibold mb-2">Approved Participations</h3>
            {participant.map((m) => (
              <div key={m._id} className="bg-gray-700 text-white p-3 mb-2 rounded shadow flex justify-between items-center">
                <div>
                  <p><strong>Username: </strong>{m.username}</p>
                  <p><strong>Driver Name: </strong>{m.driverName}</p>
                  <p><strong>Co-Driver Name: </strong>{m.coDriverName}</p>
                  <p><strong>Driver Phone: </strong>{m.driverPhone}</p>
                  <p><strong>Co-Driver Phone: </strong>{m.coDriverPhone}</p>
                  <p className="text-sm text-gray-300">{m.emailOrPhone || '-'}</p>
                  <p className="text-xs text-gray-400">Approved: {m.date}</p>
                </div>
                <button
                  onClick={async () => {
                    setConfirm({
                      isOpen: true,
                      message: "Delete this Participant?",
                      onConfirm: async () => {
                        try {
                          const res = await fetch("/api/events/delete", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: m._id }),
                          });

                          const result = await res.json();

                          if (res.ok) {
                            // update state supaya UI langsung refresh
                            setParticipants((prev) => prev.filter((act) => act._id !== m._id));
                            setAlert({ isOpen: true, message: "Participant deleted successfully", type: 'success' })
                          } else {
                            setAlert({ isOpen: true, message: result.message || "Failed to delete member", type: 'error' })
                          }
                          setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                        } catch (err) {
                          console.error("Delete error:", err);
                          setAlert({ isOpen: true, message: "Server error, please try again.", type: 'error' })
                          setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                        }
                      }
                    })
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )
      case "main event":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Manage Main Spartan Event</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Title</label>
              <textarea
                placeholder="Event Title"
                value={mainEventTitle}
                onChange={(e) => setMainEventTitle(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Date</label>
              <textarea
                id="mainevent-date"
                placeholder="Event Date"
                value={mainEventDate}
                onChange={(e) => setMainEventDate(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Location</label>
              <textarea
                id="mainevent-location"
                placeholder="Event Location"
                value={mainEventLocation}
                onChange={(e) => setMainEventLocation(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Description</label>
              <textarea
                id="mainevent-desc"
                placeholder="Event Description"
                value={mainEventDesc}
                onChange={(e) => setMainEventDesc(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* File input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Banner Main Event Image (Scale 1:1)</label>
              <label
                htmlFor="bannermainevent-file"
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow inline-block"
              >
                Choose Picture
              </label>
              <input
                id="bannermainevent-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMainEventName(file.name);
                    setMainEventPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {mainEventPreview && (
                <div className="mt-3 relative">
                  <div className="w-90 h-90 overflow-hidden rounded-lg shadow border border-gray-600">
                    <Image
                      src={mainEventPreview}
                      alt="Preview"
                      width={600}
                      height={600}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setMainEventPreview("");
                      setMainEventName("");
                      const fileInput = document.getElementById("bannermainevent-file") as HTMLInputElement | null;
                      if (fileInput) fileInput.value = "";
                    }}
                    className="mt-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <p className="text-sm text-gray-400">{mainEventName}</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={handleAddMainEvent}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
              >
                Add Main Event
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Main Event Reports</h3>
              {mainEventReports.map((me) => (
                <div
                  key={me._id}
                  className="bg-gray-800 text-white p-3 mb-2 rounded"
                >
                  {me.imageUrl ? (
                    <Image
                      src={me.imageUrl}
                      alt="Banner Preview"
                      width={600}
                      height={600}
                      unoptimized={me.imageUrl.startsWith("data:") || me.imageUrl.startsWith("blob:")}
                      className="w-full max-w-sm rounded-lg mb-3"
                    />
                  ) : (
                    <p className="text-gray-400 italic">No image uploaded</p>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{me.title}</p>
                      <p className="font-bold">{me.date}</p>
                      <p className="text-sm">{me.location}</p>
                      <p className="font-bold">{me.desc}</p>
                      <p className="text-xs text-gray-400">Event Date: {me.date}</p>
                      <p className="text-xs text-gray-400">
                        Created: {new Date(me.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        setConfirm({
                          isOpen: true,
                          message: "Delete this main event?",
                          onConfirm: async () => {
                            const res = await fetch("/api/mainevent/delete", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: me._id }),
                            });
                            if (res.ok) {
                              setMainEventReports((prev) =>
                                prev.filter((act) => act._id !== me._id)
                              );
                              setAlert({ isOpen: true, message: "Main event deleted successfully", type: 'success' })
                            } else {
                              setAlert({ isOpen: true, message: "Failed to delete main event", type: 'error' })
                            }
                            setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                          }
                        })
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "banner":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Manage Banners</h2>

            {/* Event Title */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Title</label>
              <textarea
                placeholder="Event Title"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Event Date */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Date</label>
              <input
                type="date"
                value={bannerDate}
                onChange={(e) => setBannerDate(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Location</label>
              <textarea
                placeholder="Location"
                value={bannerLocation}
                onChange={(e) => setBannerLocation(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Banner Image (Scale 1:1)</label>
              <label
                htmlFor="banner-file"
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow inline-block"
              >
                Choose Picture
              </label>
              <input
                id="banner-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBannerName(file.name);
                    setBannerPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {bannerPreview && (
                <div className="mt-3 relative">
                  <div className="w-90 h-90 overflow-hidden rounded-lg shadow border border-gray-600">
                    <Image
                      src={bannerPreview}
                      alt="Preview"
                      width={600}
                      height={600}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setBannerPreview("");
                      setBannerName("");
                      const fileInput = document.getElementById("banner-file") as HTMLInputElement | null;
                      if (fileInput) fileInput.value = "";
                    }}
                    className="mt-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <p className="text-sm text-gray-400">{bannerName}</p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="mt-6">
              <button
                onClick={handleUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
              >
                Upload Banner
              </button>
            </div>

            {/* Uploaded banners list */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Uploaded Banners</h3>
              {bannerReports.map((b) => (
                <div
                  key={b._id}
                  className="bg-gray-800 text-white p-4 mb-3 rounded-lg shadow"
                >
                  <Image
                    src={b.imageUrl}
                    alt="Banner Preview"
                    width={600}
                    height={600}
                    unoptimized={b.imageUrl.startsWith("data:") || b.imageUrl.startsWith("blob:")}
                    className="w-full max-w-sm rounded-lg mb-3"
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{b.title}</p>
                      <p className="text-sm">{b.location}</p>
                      <p className="text-xs text-gray-400">Event Date: {b.eventDate}</p>
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(b.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'finance':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Finance Management</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                id="finance-desc"
                placeholder="Description"
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Amount</label>
              <input
                id="finance-amt"
                type="number"
                placeholder="Total Amount"
                className="bg-gray-800 w-1/2 p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <button
              onClick={async () => {
                const desc = (document.getElementById("finance-desc") as HTMLInputElement)?.value;
                const amt = parseFloat((document.getElementById("finance-amt") as HTMLInputElement)?.value || "0");

                if (desc && amt) {
                  setConfirm({
                    isOpen: true,
                    message: 'Submit finance report?',
                    onConfirm: async () => {
                      const res = await fetch('/api/finance/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          description: desc,
                          amount: amt,
                          date: new Date().toLocaleString()
                        }),
                      });

                      if (res.ok) {
                        const data = await res.json();
                        setFinanceRecords(prev => [...prev, {
                          _id: data._id || String(Date.now()),
                          description: desc,
                          amount: amt,
                          date: new Date().toLocaleString()
                        }]);
                        setTotalAmount(null);
                        setAlert({ isOpen: true, message: "Finance report submitted successfully", type: 'success' })
                      } else {
                        setAlert({ isOpen: true, message: "Failed to submit finance report", type: 'error' })
                      }
                      setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                    }
                  })
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
            >
              Submit Report
            </button>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Submitted Finance Records</h3>
              <table className="w-full mb-2 text-left">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-2">Description</th>
                    <th className="py-2">Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {financeRecords.map((f, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="py-2">{f.description}</td>
                      <td className="py-2">Rp{f.amount.toLocaleString()}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={async () => {
                            setConfirm({
                              isOpen: true,
                              message: 'Delete this finance record?',
                              onConfirm: async () => {
                                const recordToDelete = financeRecords[i];
                                const res = await fetch('/api/finance/delete', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: recordToDelete._id }),
                                });

                                if (res.ok) {
                                  const updated = financeRecords.filter((_, idx) => idx !== i);
                                  setFinanceRecords(updated);
                                  setTotalAmount(null);
                                  setAlert({ isOpen: true, message: "Finance record deleted successfully", type: 'success' })
                                } else {
                                  setAlert({ isOpen: true, message: "Failed to delete finance record", type: 'error' })
                                }
                                setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                              }
                            })
                          }}

                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={calculateTotal}
                className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <FaPlus /> Total
              </button>
              {totalAmount !== null && (
                <p className="mt-2">Total Amount: <strong>Rp{totalAmount.toLocaleString()}</strong></p>
              )}
              <button
                onClick={() => {
                  const doc = new jsPDF()

                  doc.setFontSize(18)
                  doc.text('Finance Report', 14, 22)

                  autoTable(doc, {
                    startY: 30,
                    head: [['Description', 'Amount (Rp)', 'Date']],
                    body: financeRecords.map(record => [
                      record.description,
                      record.amount.toLocaleString(),
                      record.date
                    ]),
                  })
                  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY

                  if (totalAmount !== null && finalY !== undefined) {
                    doc.text(`Total: Rp${totalAmount.toLocaleString()}`, 14, finalY + 10)
                  }

                  doc.save('finance_report.pdf')
                }}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        )
      case "activities":
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Manage Activities</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Activity Title</label>
              <textarea
                placeholder="Activity Title"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                id="activity-desc"
                placeholder="Description"
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Multiple file input */}
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1">Activity Images (Multiple)</label>
              <label
                htmlFor="activity-files"
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow inline-block"
              >
                Choose Pictures
              </label>
              <input
                id="activity-files"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    const readers: Promise<string>[] = [];
                    Array.from(files).forEach((file) => {
                      readers.push(
                        new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onloadend = () => resolve(reader.result as string);
                          reader.readAsDataURL(file);
                        })
                      );
                    });
                    Promise.all(readers).then((base64Images) => {
                      setActivityImages(base64Images);
                    });
                  }
                }}
              />
            </div>

            {activityImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-4">
                {activityImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <Image
                      src={img}
                      alt={`Preview ${idx}`}
                      width={300}
                      height={300}
                      unoptimized
                      className="w-full max-w-md rounded mb-2 shadow"
                    />
                    <button
                      onClick={() =>
                        setActivityImages(activityImages.filter((_, i) => i !== idx))
                      }
                      className="mt-2 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleAddActivity}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
              >
                Add Activity
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Activity Reports</h3>
              {activityReports.map((a) => (
                <div
                  key={a._id}
                  className="bg-gray-800 text-white p-3 mb-2 rounded"
                >
                  {/* render multiple images */}
                  {a.images?.map((img: string, idx: number) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`Activity ${idx}`}
                      width={600}
                      height={400}
                      unoptimized={img.startsWith("data:") || img.startsWith("blob:")}
                      className="w-full max-w-sm rounded mb-2"
                    />
                  ))}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">{a.name}</p>
                      <p>
                        <strong>{a.title}</strong>
                      </p>
                      <p>{a.desc}</p>
                      <p className="text-xs text-gray-400">
                        Added: {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        setConfirm({
                          isOpen: true,
                          message: "Delete this activity?",
                          onConfirm: async () => {
                            const res = await fetch("/api/activity/delete", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: a._id }),
                            });
                            if (res.ok) {
                              setActivityReports((prev) =>
                                prev.filter((act) => act._id !== a._id)
                              );
                              setAlert({ isOpen: true, message: "Activity deleted successfully", type: 'success' })
                            } else {
                              setAlert({ isOpen: true, message: "Failed to delete activity", type: 'error' })
                            }
                            setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                          }
                        })
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Event Schedule Management</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Title</label>
              <textarea
                placeholder="Event Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-gray-800 w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <button
              onClick={async () => {
                if (eventDate && eventTitle) {
                  setConfirm({
                    isOpen: true,
                    message: 'Save event schedule?',
                    onConfirm: async () => {
                      const payload = {
                        date: eventDate,
                        title: eventTitle,
                        created: new Date().toLocaleString(),
                      };

                      const res = await fetch('/api/schedule/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });

                      if (res.ok) {
                        const newEvent = await res.json();
                        setSchedules(prev => [...prev, {
                          _id: newEvent._id || String(Date.now()),
                          date: eventDate,
                          title: eventTitle,
                          created: new Date().toLocaleString()
                        }]);
                        setEventDate('');
                        setEventTitle('');
                        setAlert({ isOpen: true, message: 'Event schedule saved successfully', type: 'success' })
                      } else {
                        setAlert({ isOpen: true, message: 'Failed to save schedule', type: 'error' })
                      }
                      setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                    }
                  })
                }
              }}

              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
            >
              Mark Event Date
            </button>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Scheduled Events</h3>
              {schedules.map((s, i) => (
                <div key={i} className="bg-gray-800 text-white p-3 mb-2 rounded flex justify-between items-center">
                  <div>
                    <p><strong>{s.title}</strong> on {s.date}</p>
                    <p className="text-xs text-gray-400">Added: {s.created}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setConfirm({
                        isOpen: true,
                        message: 'Delete this event schedule?',
                        onConfirm: async () => {
                          const recordToDelete = schedules[i];
                          const res = await fetch('/api/schedule/delete', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: recordToDelete._id }),
                          });

                          if (res.ok) {
                            const updated = schedules.filter((_, idx) => idx !== i);
                            setSchedules(updated);
                            setAlert({ isOpen: true, message: 'Event schedule deleted successfully', type: 'success' })
                          } else {
                            setAlert({ isOpen: true, message: 'Failed to delete event schedule', type: 'error' })
                          }
                          setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
                        }
                      })
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>
          Admin Dashboard
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
            setActiveTab('members')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'members'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaClipboardList />
          {sidebarOpen && 'Members'}
        </button>
        <button
          onClick={() => {
            setActiveTab('event participants')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'event participants'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaClipboardCheck />
          {sidebarOpen && 'Event Participants'}
        </button>
        <button
          onClick={() => {
            setActiveTab('main event')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'main event'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaTruckMonster />
          {sidebarOpen && 'Main Event'}
        </button>
        <button
          onClick={() => {
            setActiveTab('banner')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'banner'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaImages />
          {sidebarOpen && 'Banner'}
        </button>
        <button
          onClick={() => {
            setActiveTab('finance')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'finance'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaMoneyBill />
          {sidebarOpen && 'Finance'}
        </button>
        <button
          onClick={() => {
            setActiveTab('activities')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'activities'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaList />
          {sidebarOpen && 'Activities'}
        </button>
        <button
          onClick={() => {
            setActiveTab('schedule')
            setMobileSidebar(false)
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === 'schedule'
            ? 'bg-red-600'
            : 'bg-gray-800 hover:bg-red-500'
            }`}
        >
          <FaCalendarAlt />
          {sidebarOpen && 'Schedule'}
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
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebar(false)} // klik luar sidebar untuk menutup
          >
            <motion.div
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute left-0 top-0 w-64 h-full bg-gray-900 shadow-xl z-50"
              onClick={(e) => e.stopPropagation()} // biar klik di sidebar gak nutup
            >
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Main content dengan scroll terpisah */}
      <main className="flex-1 h-screen overflow-y-auto p-6 relative">
        <h1 className="absolute top-4 right-4 text-white md:hidden text-lg font-semibold mb-2">Admin Dashboard</h1>
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

      {/* Custom Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ isOpen: false, message: '', type: 'info' })}
      />

      {/* Custom Confirm Component */}
      <Confirm
        isOpen={confirm.isOpen}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ isOpen: false, message: '', onConfirm: () => {} })}
      />
    </div>
  )
}