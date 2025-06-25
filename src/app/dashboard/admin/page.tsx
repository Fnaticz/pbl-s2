// src/app/dashboard/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import type { IBanner } from '../../../../models/banner';
import Link from 'next/link'
import { FaUser, FaClipboardList, FaImages, FaMoneyBill, FaCalendarAlt, FaList, FaTrash, FaPlus } from 'react-icons/fa'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('stats')
    const [members, setMembers] = useState<{
        _id: string;
        username: string;
        emailOrPhone: string;
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
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [bannerName, setBannerName] = useState('')
    const [activityPreview, setActivityPreview] = useState<string | null>(null)
    const [activityName, setActivityName] = useState('')
    const [activityTitle, setActivityTitle] = useState('')
    const [activityReports, setActivityReports] = useState<{ _id: string; title: string; name: string; desc: string; date: string; preview: string; imageUrl: string }[]>([])
    const [financeRecords, setFinanceRecords] = useState<{ _id: string; description: string; amount: number; date: string }[]>([])
    const [totalAmount, setTotalAmount] = useState<number | null>(null)
    const [schedules, setSchedules] = useState<{ _id: string; date: string; title: string; created: string }[]>([])
    const [eventDate, setEventDate] = useState('')
    const [eventTitle, setEventTitle] = useState('')
    const [stats, setStats] = useState({ totalMembers: 0, pendingMembers: 0 });
    const [bannerReports, setBannerReports] = useState<IBanner[]>([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const fetchMembers = async () => {
        const res = await fetch('/api/members/list');
        const data = await res.json();
        setPendingMember(data.pending);
        setMembers(data.approved);
    };

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

    const calculateTotal = () => {
        const total = financeRecords.reduce((sum, record) => sum + record.amount, 0)
        setTotalAmount(total)
    }

    useEffect(() => {
        const stored = localStorage.getItem('pendingMembers')
        if (stored) setPendingMember(JSON.parse(stored))
    }, [])

    const pushInboxMessage = (msg: { from: string; type: 'admin' | 'tag'; content: string; message: string; date: string }) => {
        const inbox = JSON.parse(localStorage.getItem('inboxMessages') || '[]')
        inbox.push(msg)
        localStorage.setItem('inboxMessages', JSON.stringify(inbox))
    }

<<<<<<< HEAD
    const handleAccept = (index: number) => {
        const confirmAccept = confirm('Accept this member?')
        if (!confirmAccept) return
        const member = pendingMember[index]
        const newMember = {
            username: member.username,
            email: member.email,
            date: new Date().toLocaleString()
=======
    const handleAccept = async (id: string) => {
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
            alert('Accepted successfully');
          } else {
            alert(result.message || 'Failed to accept');
          }
        } catch (error) {
          console.error(error);
          alert('Error accepting application');
>>>>>>> 022809cc0fa2de6623448a7aafdc99f2fe7345f4
        }
      };
      
      const handleReject = async (id: string) => {
        try {
          const res = await fetch('/api/members/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'reject' })
          });
      
          const result = await res.json();
          if (res.ok) {
            setPendingMember(prev => prev.filter(m => m._id !== id));
            alert('Rejected successfully');
          } else {
            alert(result.message || 'Failed to reject');
          }
        } catch (error) {
          console.error(error);
          alert('Error rejecting application');
        }
      };
      
      const handleUpload = async () => {
        const fileInput = document.getElementById("banner-file") as HTMLInputElement;
        const file = fileInput?.files?.[0];

<<<<<<< HEAD
        pushInboxMessage({
            from: 'Admin',
            type: 'admin',
            content: `Your application has been approved. Welcome, ${member.name}!`,
            message: `${member.message}`,
            date: new Date().toLocaleString()
        })
=======
        if (!file || !confirm("Upload this banner?")) return;
>>>>>>> 022809cc0fa2de6623448a7aafdc99f2fe7345f4

        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64 = reader.result;

          try {
            const res = await fetch('/api/banner/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: file.name,
                file: base64
              }),
            });

<<<<<<< HEAD
        pushInboxMessage({
            from: 'Admin',
            type: 'admin',
            content: `Sorry ${member.name}, your registration was rejected.`,
            message: `${member.message}`,
            date: new Date().toLocaleString()
        })
=======
            if (res.ok) {
              const newBanner = await res.json();
              setBannerReports(prev => [...prev, newBanner]);
              alert("Banner uploaded!");
              setBannerPreview(null);
              setBannerName('');
              fileInput.value = '';
            } else {
              alert("Failed to upload banner");
            }
          } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload error occurred");
          }
        };

        reader.readAsDataURL(file);
      };
      
      
      const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return;
      
        const res = await fetch('/api/banner/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      
        if (res.ok) {
          setBannerReports(prev => prev.filter(b => b._id !== id));
        } else {
          alert('Failed to delete banner');
        }
      };

      const handleAddActivity = async () => {
        const desc = (document.getElementById("activity-desc") as HTMLInputElement)?.value;
        const fileInput = document.getElementById("activity-file") as HTMLInputElement;
        const file = fileInput?.files?.[0];
      
        if (!file || !activityTitle || !desc) return alert("All fields required");
      
        if (!confirm("Add this activity?")) return;
      
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result;
      
          const res = await fetch('/api/activity/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: activityTitle,
              name: file.name,
              desc,
              file: base64
            }),
          });
      
          if (res.ok) {
            const newActivity = await res.json();
            setActivityReports([...activityReports, newActivity]);
            alert("Activity uploaded!");
            setActivityTitle('');
            setActivityName('');
            setActivityPreview(null);
            (document.getElementById("activity-desc") as HTMLInputElement).value = '';
            fileInput.value = '';
          } else {
            alert("Upload failed");
          }
        };
      
        reader.readAsDataURL(file);
      };
      
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

      const router = useRouter()
      const [accessLoading, setAccessLoading] = useState(true)
      const [allowed, setAllowed] = useState(false)

      useEffect(() => {
        const userString = localStorage.getItem('currentUser')
        if (!userString) {
          router.replace('/login')
          return
        }

        try {
          const user = JSON.parse(userString)
          if (user.role === 'admin') {
            setAllowed(true)
          } else {
            notFound()
          }
        } catch {
          notFound()
        } finally {
          setAccessLoading(false)
        }
      }, [router])

      if (accessLoading) return <p className="text-white text-center pt-32">Checking access...</p>
      if (!allowed) return null
>>>>>>> 022809cc0fa2de6623448a7aafdc99f2fe7345f4


    const renderSection = () => {
        switch (activeTab) {
            case 'stats':
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Member Statistics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700 text-white p-4 rounded shadow">Total Members: {stats.totalMembers}</div>
                            <div className="bg-gray-700 text-white p-4 rounded shadow">Pending Members: {stats.pendingMembers}</div>
                        </div>
                    </div>
                )
            case 'members':
                return (
                    <div>
<<<<<<< HEAD
                        <h2 className="text-xl font-bold mb-4">Member Registration Management</h2>
                        {pendingMember.length > 0 ? (
                            pendingMember.map((m, i) => (
                                <div className="bg-gray-700 text-white p-4 rounded shadow mb-4">
                                    <p><strong>Username:</strong> {m.username}</p>
                                    <p><strong>Email:</strong> {m.email}</p>
                                    <p><strong>Name:</strong> {m.name}</p>
                                    <p><strong>Address:</strong> {m.address}</p>
                                    <p><strong>Phone:</strong> {m.phone}</p>
                                    <p><strong>Hobby:</strong> {m.hobby}</p>
                                    <p><strong>Vehicle Type:</strong> {m.vehicleType}</p>
                                    <p><strong>Vehicle Spec:</strong> {m.vehicleSpec}</p>
                                    <textarea
                                        className="w-full p-2 rounded bg-white/10 text-white"
                                        placeholder="Message to applicant..."
                                        value={m.message}
                                        onChange={(e) => {
                                            const updated = [...pendingMember]
                                            updated[i].message = e.target.value
                                            setPendingMember(updated)
                                        }}
                                    />

                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleAccept(i)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Accept</button>
                                        <button onClick={() => handleReject(i)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 mb-4">No new registration.</p>
                        )}
=======
                    <h2 className="text-xl font-bold mb-4">Member Registration Management</h2>
>>>>>>> 022809cc0fa2de6623448a7aafdc99f2fe7345f4

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
                            <button onClick={() => handleAccept(m._id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Accept</button>
                            <button onClick={() => handleReject(m._id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
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
                            onClick={() => {
                            const confirmDelete = confirm('Remove member rights?');
                            if (confirmDelete) {
                                setMembers(members.filter((user) => user._id !== m._id));
                            }
                            }}
                            className="text-red-600 hover:text-red-800"
                        >
                            <FaTrash />
                        </button>
                        </div>
                    ))}
                    </div>

                )
                case 'banner':
                  return (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Manage Banners</h2>
                      <input
                        id="banner-file"
                        type="file"
                        className="mb-2"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBannerName(file.name);
                            setBannerPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {bannerPreview && (
                        <div className="mb-4">
                          <img src={bannerPreview} alt="Preview" className="w-full max-w-md rounded mb-1" />
                          <p className="text-sm text-gray-300">{bannerName}</p>
                        </div>
                      )}
                      <button
                        onClick={handleUpload}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Upload Banner
                      </button>
                
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Uploaded Banners</h3>
                        {bannerReports.map((b) => (
                          <div key={b._id} className="bg-gray-800 text-white p-3 mb-2 rounded">
                            <img src={b.imageUrl} alt="Banner Preview" className="w-full max-w-sm rounded mb-2" />
                            <div className="flex justify-between items-center">
                              <div>
                                <p>{b.name}</p>
                                <p className="text-xs text-gray-400">Uploaded: {new Date(b.uploadedAt).toLocaleString()}</p>
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
                        <input id="finance-desc" type="text" placeholder="Description" className="bg-gray-700 w-full mb-2 p-2 border rounded" />
                        <input id="finance-amt" type="number" placeholder="Amount" className="bg-gray-700 w-full mb-2 p-2 border rounded" />
                        <button
                            onClick={async () => {
                                const desc = (document.getElementById("finance-desc") as HTMLInputElement)?.value;
                                const amt = parseFloat((document.getElementById("finance-amt") as HTMLInputElement)?.value || "0");
                              
                                if (desc && amt && confirm('Submit finance report?')) {
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
                                  }
                                }
                              }}                              
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                                                        if (!confirm('Delete this finance record?')) return;
                                                      
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
                                                        }
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
                        </div>
                    </div>
                )
            case 'activities':
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Manage Activities</h2>
                        <input
                          id="activity-file"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setActivityName(file.name);
                          
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setActivityPreview(base64);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          
                          className="mb-2"
                        />
                        <input
                            type="text"
                            placeholder="Title"
                            value={activityTitle}
                            onChange={(e) => setActivityTitle(e.target.value)}
                            className="bg-gray-700 w-full mb-2 p-2 border rounded"
                        />
                        {activityPreview && (
                          <div className="mb-4">
                            <img src={activityPreview} alt="Preview" className="w-full max-w-md rounded mb-1" />
                            <p className="text-sm text-gray-700">{activityName}</p>
                          </div>
                        )}
                        <input id="activity-desc" type="text" placeholder="Description" className="bg-gray-700 w-full mb-2 p-2 border rounded" />
                        <button
                            onClick={handleAddActivity}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                            Add Activity
                        </button>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Activity Reports</h3>
                            {activityReports.map((a, i) => (
                                <div key={i} className="bg-gray-800 text-white p-3 mb-2 rounded">
                                    <img src={a.imageUrl} alt="Activity Preview" className="w-full max-w-sm rounded mb-2" />
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className='text-sm text-gray-400'>{a.name}</p>
                                            <p><strong>{a.title}</strong></p>
                                            <p>{a.desc}</p>
                                            <p className="text-xs text-gray-400">Added: {a.date}</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Delete this activity?')) return;
                                                const res = await fetch('/api/activity/delete', {
                                                  method: 'DELETE',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ id: a._id }),
                                                });
                                                if (res.ok) {
                                                  setActivityReports(prev => prev.filter(act => act._id !== a._id));
                                                }
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
                )
            case 'schedule':
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Event Schedule Management</h2>
                        <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="bg-gray-700 w-full mb-2 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            className="bg-gray-700 w-full mb-2 p-2 border rounded"
                        />
                        <button
                            onClick={async () => {
                                if (eventDate && eventTitle && confirm('Save event schedule?')) {
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
                                  } else {
                                    alert('Failed to save schedule');
                                  }
                                }
                              }}
                              
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                                            if (!confirm('Delete this event schedule?')) return;
                                          
                                            const recordToDelete = schedules[i];
                                            const res = await fetch('/api/schedule/delete', {
                                              method: 'DELETE',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ id: recordToDelete._id }),
                                            });
                                          
                                            if (res.ok) {
                                              const updated = schedules.filter((_, idx) => idx !== i);
                                              setSchedules(updated);
                                            }
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

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
            <main className="flex-grow pt-20 px-4 pb-16">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={() => setActiveTab('stats')} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded shadow hover:bg-red-500"><FaUser /> Stats</button>
                    <button onClick={() => setActiveTab('members')} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded shadow hover:bg-red-500"><FaClipboardList /> Members</button>
                    <button onClick={() => setActiveTab('banner')} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded shadow hover:bg-red-500"><FaImages /> Banner</button>
                    <button onClick={() => setActiveTab('finance')} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded shadow hover:bg-red-500"><FaMoneyBill /> Finance</button>
                    <button onClick={() => setActiveTab('activities')} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded shadow hover:bg-red-500"><FaList /> Activities</button>
                    <button onClick={() => setActiveTab('schedule')} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded shadow hover:bg-red-500"><FaCalendarAlt /> Schedule</button>
                </div>
                <div className="bg-gray-900 p-6 rounded shadow">
                    {renderSection()}
                </div>
            </main>
        </div>
    )
}