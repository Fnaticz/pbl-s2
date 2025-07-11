'use client'

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'

type User = {
  username: string
  email: string
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

  const [user] = useState<User | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!user) {
      alert('Login required to register.')
      return
    }

    const newEntry: FormData = {
      ...formData,
      username: user.username,
      email: user.email,
    }

    try {
      const res = await fetch('/api/member-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      })

      const result = await res.json()
      if (res.ok) {
        alert('Application submitted! Waiting for admin approval.')
        setFormData({
          username: '',
          email: '',
          name: '',
          address: '',
          phone: '',
          hobby: '',
          vehicleType: '',
          vehicleSpec: '',
        })
      } else {
        alert(result.message || 'Submission failed')
      }
    } catch (err) {
      console.error(err)
      alert('Server error. Please try again later.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
      <main className="flex-grow pt-20 px-4 pb-16">
        <h1 className="text-3xl font-bold mb-6 text-center">Member Registration Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            required
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            required
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            required
          />
          <input
            type="text"
            name="hobby"
            value={formData.hobby}
            onChange={handleChange}
            placeholder="Hobby"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
          <input
            type="text"
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            placeholder="Vehicle Type"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
          <input
            type="text"
            name="vehicleSpec"
            value={formData.vehicleSpec}
            onChange={handleChange}
            placeholder="Vehicle Specification"
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white font-semibold"
          >
            Submit Application
          </button>
        </form>
      </main>
    </div>
  )
}
