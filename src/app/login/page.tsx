'use client'

import { useState } from 'react'
import { signIn, useSession } from "next-auth/react";
import Link from 'next/link'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const response = await signIn("credentials", {
      redirect: false,
      username: formData.username,
      password: formData.password,
    });

    if (response?.error) {
      setMessage("Invalid email or password");
      toast.error("Invalid email or password");
      if (response?.url) router.replace("/dashboard");
    } else {
      setMessage("");
      toast.success("Successful login");
    }

    const data = await res.json();
    setMessage(data.message);

    //direct linknya
    if (data.success) {
      window.location.href = '/profile';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-cover bg-center">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">LOGIN</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-white mb-1">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <button type="submit" className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition">
            Login
          </button>

          {message && <p className="text-center text-sm text-red-500 mt-2">{message}</p>}
        </form>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => {
              signIn("google");
            }}
            className="flex w-full items-center border border-gray-300 justify-center gap-3 rounded-md bg-white px-3 py-1.5 text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <FcGoogle />
            Google
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition">
            <img src="/facebooklogo.png" className="w-5 h-5" alt="Facebook" />
            Facebook
          </button>
        </div>

        <Link href="/register" className="block text-center text-sm mt-4 text-blue-400 hover:underline">
          Or Register
        </Link>
      </div>
    </div>
  )
}
