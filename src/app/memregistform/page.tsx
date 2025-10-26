'use client'

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
  name: string
  address: string
  phone: string
  hobby: string
  vehicleType: string
  vehicleSpec: string
}

export default function MemberRegistrationForm() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    name: '',
    address: '',
    phone: '',
    hobby: '',
    vehicleType: '',
    vehicleSpec: '',
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);

  const { data: session } = useSession()
  const user = session?.user as User | null

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.id) {
      alert("Login required to register.");
      return;
    }

    // hanya kirim data form yang perlu, userId / username / email akan diisi otomatis di API
    const newEntry = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      hobby: formData.hobby,
      vehicleType: formData.vehicleType,
      vehicleSpec: formData.vehicleSpec,
    };

    try {
      const res = await fetch("/api/members/member-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Application submitted! Waiting for admin approval.");

        // reset form
        setFormData({
          username: "",
          email: "",
          name: "",
          address: "",
          phone: "",
          hobby: "",
          vehicleType: "",
          vehicleSpec: "",
        });
      } else {
        alert(result.message || "Submission failed");
      }
    } catch (err) {
      console.error("Error submitting member application:", err);
      alert("Server error. Please try again later.");
    }
  };


  if (loading) return <Loading />;

  return (
    <section className="min-h-screen flex flex-col bg-gradient-to-b from-stone-950 to-red-950 text-white px-6 py-20">
      <main className="flex-grow w-full max-w-5xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl mt-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          📝 Member Registration Form
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">Full Name</label>
            <textarea
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">Phone Number</label>
            <textarea
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>

          {/* Hobby */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">Hobby</label>
            <textarea
              name="hobby"
              value={formData.hobby}
              onChange={handleChange}
              placeholder="Enter your hobby"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>

          {/* Vehicle Type */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">Vehicle Type</label>
            <textarea
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              placeholder="Enter your vehicle type"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>

          {/* Vehicle Specification */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">Vehicle Specification</label>
            <textarea
              name="vehicleSpec"
              value={formData.vehicleSpec}
              onChange={handleChange}
              placeholder="Enter your vehicle specification"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition"
          >
            Submit Application
          </button>
        </form>
      </main>
    </section>
  )
}
