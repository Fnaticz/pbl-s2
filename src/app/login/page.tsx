'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cek session saat load
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user?.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (session?.user?.role === 'member') {
        router.push('/dashboard/member');
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (!searchParams) return;
    
    const error = searchParams.get('error');
    if (error === 'Credentials') {
      toast.error('Username atau password salah');
    } else if (error === 'OAuthAccountNotLinked') {
      toast.error('Email sudah terdaftar dengan metode login lain');
    } else if (error === 'Configuration') {
      toast.error('Konfigurasi login salah. Cek environment variable');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await signIn('credentials', {
      redirect: false,
      username: formData.username,
      password: formData.password,
    });

    if (!response || response.error) {
      toast.error('Login gagal. Periksa kembali data Anda.');
      return;
    }

    const session = await getSession();
    if (!session?.user) {
      toast.error('Gagal mengambil session');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(session.user));
    toast.success('Login berhasil');

    if (session.user.role === 'admin') {
      router.push('/dashboard/admin');
    } else if (session.user.role === 'member') {
      router.push('/dashboard/member');
    } else {
      toast.warning('Akses ditolak');
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
        </form>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 px-8 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition"
          >
            <FcGoogle />
            Google
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition">
            <Image src="/facebooklogo.png" alt="Facebook" width={20} height={20} className="w-5 h-5" />
            Facebook
          </button>
        </div>

        <Link href="/register" className="block text-center text-sm mt-4 text-blue-400 hover:underline">
          Or Register
        </Link>
      </div>
    </div>
  );
}
