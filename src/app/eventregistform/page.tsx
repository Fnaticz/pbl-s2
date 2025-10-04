"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/react'
import Loading from '../components/Loading';

type User = {
  username: string
  emailOrPhone?: string
  role?: string
}

type FormData = {
  username: string
  email: string
  driverName: string
  coDriverName: string
  carName: string
  driverPhone: string
  coDriverPhone: string
  policeNumber: string
  address: string
  teamName: string
}

export default function RegisterEventPage() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    driverName: '',
    coDriverName: '',
    carName: '',
    driverPhone: '',
    coDriverPhone: '',
    policeNumber: '',
    address: '',
    teamName: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);

  const { data: session } = useSession();
  console.log(session?.user.id); // <- ini ObjectId dari Member


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!session?.user?.id) {
      alert('Login required to register.')
      return
    }

    const payload = {
      userId: session.user.id, // ambil dari session
      driverName: formData.driverName,
      coDriverName: formData.coDriverName,
      carName: formData.carName,
      driverPhone: formData.driverPhone,
      coDriverPhone: formData.coDriverPhone,
      policeNumber: formData.policeNumber,
      teamName: formData.teamName,
      address: formData.address
    };

    try {
      const res = await fetch('/api/events/event-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Event registration submitted!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to register event");
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Please try again later.');
    }
  }


  if (loading) return <Loading />;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-950 to-red-950 py-16 px-6">
      <div className="bg-stone-900/90 text-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register Spartan Event
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="driverName"
            placeholder="Nama Driver"
            value={formData.driverName}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />
          <input
            type="text"
            name="coDriverName"
            placeholder="Nama Co-Driver"
            value={formData.coDriverName}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />
          <input
            type="text"
            name="carName"
            placeholder="Nama Mobil"
            value={formData.carName}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />
          <input
            type="text"
            name="driverPhone"
            placeholder="Nomor HP driver"
            value={formData.driverPhone}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />
          <input
            type="text"
            name="coDriverPhone"
            placeholder="Nomor HP co-driver"
            value={formData.coDriverPhone}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />
          <input
            type="text"
            name="policeNumber"
            placeholder="Nomor Plat Mobil"
            value={formData.policeNumber}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Alamat"
            value={formData.address}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />
          <input
            type="text"
            name="teamName"
            placeholder="Nama Team"
            value={formData.teamName}
            onChange={handleChange}
            className="p-3 rounded-lg bg-stone-800 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="mt-4 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 font-semibold transition"
          >
            Submit Registration
          </button>
        </form>
      </div>
    </section>
  );
}
