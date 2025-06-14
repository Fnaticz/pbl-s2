'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaUser, FaClipboardList, FaImages, FaMoneyBill, FaCalendarAlt, FaList, FaTrash, FaPlus } from 'react-icons/fa'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('stats')
    const [members, setMembers] = useState<{ username: string; email: string; date: string }[]>([])
    const [pendingMember, setPendingMember] = useState<{
        username: string;
        email: string;
        name: string;
        address: string;
        phone: string;
        hobby: string;
        vehicleType: string;
        vehicleSpec: string;
    }[]>([])
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [bannerName, setBannerName] = useState('')
    const [bannerReports, setBannerReports] = useState<{ name: string; date: string; preview: string }[]>([])
    const [activityPreview, setActivityPreview] = useState<string | null>(null)
    const [activityName, setActivityName] = useState('')
    const [activityTitle, setActivityTitle] = useState('')
    const [activityReports, setActivityReports] = useState<{ title: string; name: string; desc: string; date: string; preview: string }[]>([])
    const [financeRecords, setFinanceRecords] = useState<{ description: string; amount: number; date: string }[]>([])
    const [totalAmount, setTotalAmount] = useState<number | null>(null)
    const [schedules, setSchedules] = useState<{ date: string; title: string; created: string }[]>([])
    const [eventDate, setEventDate] = useState('')
    const [eventTitle, setEventTitle] = useState('')

    const calculateTotal = () => {
        const total = financeRecords.reduce((sum, record) => sum + record.amount, 0)
        setTotalAmount(total)
    }

    useEffect(() => {
        const stored = localStorage.getItem('pendingMembers')
        if (stored) setPendingMember(JSON.parse(stored))
    }, [])

    const pushInboxMessage = (msg: { from: string; type: 'admin' | 'tag'; content: string; date: string }) => {
        const inbox = JSON.parse(localStorage.getItem('inboxMessages') || '[]')
        inbox.push(msg)
        localStorage.setItem('inboxMessages', JSON.stringify(inbox))
    }

    const handleAccept = (index: number) => {
        const confirmAccept = confirm('Accept this member?')
        if (!pendingMember) return
        const member = pendingMember[index]
        const newMember = {
            username: member.username,
            email: member.email,
            date: new Date().toLocaleString()
        }
        const updated = [...members, newMember]
        setMembers(updated)
        localStorage.setItem('approvedMembers', JSON.stringify(updated))

        pushInboxMessage({
            from: 'Admin',
            type: 'admin',
            content: `Your application has been approved. Welcome, ${member.name}!`,
            date: new Date().toLocaleString()
        })


        const updatedPending = pendingMember.filter((_, i) => i !== index)
        setPendingMember(updatedPending)
        localStorage.setItem('pendingMembers', JSON.stringify(updatedPending))
    }

    const handleReject = (index: number) => {
        const member = pendingMember[index]
        const confirmReject = confirm('Reject this application?')
        if (!confirmReject) return

        pushInboxMessage({
            from: 'Admin',
            type: 'admin',
            content: `Sorry ${member.name}, your registration was rejected.`,
            date: new Date().toLocaleString()
        })

        const updated = pendingMember.filter((_, i) => i !== index)
        setPendingMember(updated)
        localStorage.setItem('pendingMembers', JSON.stringify(updated))
        alert('Application rejected.')
    }

    const renderSection = () => {
        switch (activeTab) {
            case 'stats':
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Member Statistics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700 text-white p-4 rounded shadow">Total Members: {0 + members.length}</div>
                            <div className="bg-gray-700 text-white p-4 rounded shadow">Pending Members: {pendingMember.length}</div>
                        </div>
                    </div>
                )
            case 'members':
                return (
                    <div>
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
                                    <textarea placeholder="Message to applicant..." className="w-full mt-2 p-2 border rounded"></textarea>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleAccept(i)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Accept</button>
                                        <button onClick={() => handleReject(i)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 mb-4">No new registration.</p>
                        )}

                        <h3 className="text-lg font-semibold mb-2">Approved Members</h3>
                        {members.map((m, i) => (
                            <div key={i} className="bg-gray-700 text-white p-3 mb-2 rounded shadow flex justify-between items-center">
                                <div>
                                    <p><strong>{m.username}</strong></p>
                                    <p className="text-sm text-gray-300">{m.email}</p>
                                    <p className="text-xs text-gray-400">Approved: {m.date}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        const confirmDelete = confirm('Remove member rights?')
                                        if (confirmDelete) {
                                            setMembers(members.filter((_, idx) => idx !== i))
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
                        <h2 className="text-xl font-bold mb-4">Manage Slideshow Banners</h2>
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const preview = URL.createObjectURL(file)
                                    setBannerName(file.name)
                                    setBannerPreview(preview)
                                }
                            }}
                            className="mb-2 hover:text-red-500"
                        />
                        {bannerPreview && (
                            <div className="mb-4">
                                <img src={bannerPreview} alt="Preview" className="w-full max-w-md rounded mb-1" />
                                <p className="text-sm text-gray-700">{bannerName}</p>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                if (bannerName && bannerPreview && confirm('Confirm to upload this banner?')) {
                                    setBannerReports([...bannerReports, { name: bannerName, date: new Date().toLocaleString(), preview: bannerPreview }])
                                    alert('Banner uploaded')
                                    setBannerPreview(null)
                                    setBannerName('')
                                }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Upload Banner
                        </button>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Uploaded Banners</h3>
                            {bannerReports.map((b, i) => (
                                <div key={i} className="bg-gray-800 text-white p-3 mb-2 rounded">
                                    <img src={b.preview} alt="Banner Preview" className="w-full max-w-sm rounded mb-2" />
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p>{b.name}</p>
                                            <p className="text-xs text-gray-400">Uploaded: {b.date}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this banner?')) {
                                                    setBannerReports(bannerReports.filter((_, idx) => idx !== i))
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
            case 'finance':
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Finance Management</h2>
                        <input id="finance-desc" type="text" placeholder="Description" className="bg-gray-700 w-full mb-2 p-2 border rounded" />
                        <input id="finance-amt" type="number" placeholder="Amount" className="bg-gray-700 w-full mb-2 p-2 border rounded" />
                        <button
                            onClick={() => {
                                const desc = (document.getElementById("finance-desc") as HTMLInputElement)?.value
                                const amt = parseFloat((document.getElementById("finance-amt") as HTMLInputElement)?.value || "0")
                                if (desc && amt && confirm('Submit finance report?')) {
                                    setFinanceRecords([...financeRecords, { description: desc, amount: amt, date: new Date().toLocaleString() }])
                                    localStorage.setItem('financeReports', JSON.stringify([...financeRecords, { description: desc, amount: amt, date: new Date().toLocaleString() }]))

                                    setTotalAmount(null)
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
                                                    onClick={() => {
                                                        if (confirm('Delete this finance record?')) {
                                                            const updated = financeRecords.filter((_, idx) => idx !== i)
                                                            setFinanceRecords(updated)
                                                            localStorage.setItem('financeReports', JSON.stringify(updated))
                                                            setTotalAmount(null)
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
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const preview = URL.createObjectURL(file)
                                    setActivityName(file.name)
                                    setActivityPreview(preview)
                                }
                            }}
                            className="mb-2 hover:text-red-500"
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
                            onClick={() => {
                                const desc = (document.getElementById("activity-desc") as HTMLInputElement)?.value
                                if (activityName && activityPreview && activityTitle && desc && confirm('Add this activity?')) {
                                    setActivityReports([...activityReports, { title: activityTitle, name: activityName, desc, date: new Date().toLocaleString(), preview: activityPreview }])
                                    alert('Activity added')
                                    setActivityName('')
                                    setActivityTitle('')
                                    setActivityPreview(null)
                                        ; (document.getElementById("activity-desc") as HTMLInputElement).value = ''
                                }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Add Activity
                        </button>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Activity Reports</h3>
                            {activityReports.map((a, i) => (
                                <div key={i} className="bg-gray-800 text-white p-3 mb-2 rounded">
                                    <img src={a.preview} alt="Activity Preview" className="w-full max-w-sm rounded mb-2" />
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className='text-sm text-gray-400'>{a.name}</p>
                                            <p><strong>{a.title}</strong></p>
                                            <p>{a.desc}</p>
                                            <p className="text-xs text-gray-400">Added: {a.date}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this activity?')) {
                                                    setActivityReports(activityReports.filter((_, idx) => idx !== i))
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
                            onClick={() => {
                                if (eventDate && eventTitle && confirm('Save event schedule?')) {
                                    const newData = [...schedules, {
                                        date: eventDate,
                                        title: eventTitle,
                                        created: new Date().toLocaleString()
                                    }]
                                    setSchedules([...schedules, {
                                        date: eventDate,
                                        title: eventTitle,
                                        created: new Date().toLocaleString()
                                    }])
                                    localStorage.setItem('eventSchedules', JSON.stringify(newData))
                                    setEventDate('')
                                    setEventTitle('')
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
                                        onClick={() => {
                                            if (confirm('Delete this event schedule?')) {
                                                const updated = schedules.filter((_, idx) => idx !== i)
                                                setSchedules(updated)
                                                localStorage.setItem('eventSchedules', JSON.stringify(updated))
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
