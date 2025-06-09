'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    emailOrPhone: '',
    password: '',
    address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-center bg-no-repeat bg-cover">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">REGISTER</h1>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <p className="text-sm mb-2">Enter your username</p>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 mb-4 rounded-full bg-white/20 placeholder-white text-white"
                required
              />
              <button type="button" onClick={nextStep} className="bg-white text-black w-full py-2 rounded-full font-bold">
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-sm mb-2">Enter your email or phone</p>
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Email or phone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 mb-4 rounded-full bg-white/20 placeholder-white text-white"
                required
              />
              <button type="button" onClick={nextStep} className="bg-white text-black w-full py-2 rounded-full font-bold">
                Next
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm mb-2">Create a password</p>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 mb-4 rounded-full bg-white/20 placeholder-white text-white"
                required
              />
              <button type="button" onClick={nextStep} className="bg-white text-black w-full py-2 rounded-full font-bold">
                Next
              </button>
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-sm mb-2">Enter your address</p>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 mb-4 rounded-full bg-white/20 placeholder-white text-white"
                required
              />
              <button type="button" onClick={nextStep} className="bg-white text-black w-full py-2 rounded-full font-bold">
                Next
              </button>
            </>
          )}
          {step === 5 && (
            <>
              <p className="text-sm mb-4">Ready to register?</p>
              <button type="submit" className="bg-white text-black w-full py-2 rounded-full font-bold">
                Register
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
