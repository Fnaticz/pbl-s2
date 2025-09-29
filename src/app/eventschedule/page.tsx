'use client'

import { useEffect, useState } from 'react'
import Loading from '../components/Loading';

type Schedule = {
  _id: string;
  title: string;
  date: string;
  created: string;
}

export default function EventSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch('/api/schedule')
        const data = await res.json()
        setSchedules(data || [])
      } catch (err) {
        console.error('Failed to fetch schedule:', err)
      }
    }

    fetchSchedules()
  }, [])

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-red-950 to-black text-white px-4 py-10">
      <main className="flex-grow pt-20 px-4 pb-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Community Event Schedule</h1>
        {schedules.length === 0 ? (
          <p className="text-center text-gray-400">No scheduled events available.</p>
        ) : (
          <ul className="space-y-4">
            {schedules.map((event, index) => (
              <li key={index} className="bg-gray-800 p-4 rounded shadow">
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-300">Scheduled Date: {event.date}</p>
                <p className="text-xs text-gray-400">Created: {event.created}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
