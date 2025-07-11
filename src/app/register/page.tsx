// src/app/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong' | ''>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'password') {
      if (value.length < 6) {
        setPasswordStrength('Weak')
      } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value)) {
        setPasswordStrength('Strong')
      } else {
        setPasswordStrength('Medium')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const { username, password } = formData

    if (!username || !password) {
      setMessage('Please complete all fields before submitting.')
      return
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        role: 'member', // ✅ tambahkan role
      }),
    });

    const data = await res.json()
    setMessage(data.message || 'Something went wrong')
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-center bg-no-repeat bg-cover">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
        {submitted ? (
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
            <p className="text-sm">Welcome, {formData.username} 🎉</p>
            <Link
              href="/login"
              className="inline-block mt-6 px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-red-600 hover:text-white transition"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white text-center mb-6">REGISTER</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm mb-1 text-white">Username</p>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white"
                  required
                />
              </div>
              <div>
                <p className="text-sm mb-1 text-white">Password</p>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white"
                  required
                />
                {passwordStrength && (
                  <p
                    className={`text-xs mt-1 font-semibold ${
                      passwordStrength === 'Strong'
                        ? 'text-green-400'
                        : passwordStrength === 'Medium'
                        ? 'text-yellow-300'
                        : 'text-red-400'
                    }`}
                  >
                    Password Strength: {passwordStrength}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition"
              >
                Register
              </button>
              {message && <p className="text-center text-sm text-red-500 mt-2">{message}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
