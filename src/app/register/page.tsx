'use client';

import { useState } from 'react';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    emailOrPhone: '',
    password: '',
    address: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, emailOrPhone, password, address } = formData;

    if (!username || !emailOrPhone || !password || !address) {
      setMessage('Please complete all fields before submitting.');
      return;
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log("RESPONSE", data);
    setMessage(data.message || 'Something went wrong');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-center bg-no-repeat bg-cover">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
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
            <p className="text-sm mb-1 text-white">Email or Phone</p>
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email or Phone"
              value={formData.emailOrPhone}
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
          </div>
          <div>
            <p className="text-sm mb-1 text-white">Address</p>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white/20 placeholder-white text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition"
          >
            Register
          </button>
          {message && ( <p className="text-center text-sm text-red-500 mt-2">{message}</p> )}
        </form>
      </div>
    </div>
  )
}