'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ 
    isOpen: false, 
    message: '', 
    type: 'info' 
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // SHOW ERROR NOTIFICATIONS FROM NextAuth
  useEffect(() => {
    if (!error) return;

    let errorMessage = "Terjadi kesalahan saat login.";
    if (error === "not_registered") {
      errorMessage = "Akun Google belum terdaftar. Silakan register terlebih dahulu.";
      setAlert({ 
        isOpen: true, 
        message: errorMessage, 
        type: 'error' 
      });
      toast.error(errorMessage);
      // Redirect ke register setelah 2 detik
      setTimeout(() => {
        router.push("/register");
      }, 2000);
    } 
    else if (error === "CredentialsSignin" || error === "Callback") {
      errorMessage = "Username atau password salah. Silakan coba lagi.";
      setAlert({ 
        isOpen: true, 
        message: errorMessage, 
        type: 'error' 
      });
      toast.error(errorMessage);
    }
  }, [error, router]);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // CHECK SESSION - Redirect jika sudah login
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session || !session.user) return;

      // Jika sudah login, redirect sesuai role
      if (session.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (session.user.role === 'member') {
        router.push('/dashboard/member');
      } else if (session.user.role === 'guest') {
        router.push('/');
      }
    };

    checkSession();
  }, [router]);

  // FORM CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // LOGIN FORM SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!formData.username || !formData.password) {
      setAlert({ 
        isOpen: true, 
        message: 'Mohon lengkapi username dan password.', 
        type: 'warning' 
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await signIn('credentials', {
        redirect: false,
        username: formData.username,
        password: formData.password,
      });

      if (!response || response.error) {
        setAlert({ 
          isOpen: true, 
          message: 'Username atau password salah. Silakan coba lagi.', 
          type: 'error' 
        });
        toast.error('Username atau password salah');
        setSubmitting(false);
        return;
      }

      const session = await getSession();
      if (!session?.user) {
        setAlert({ 
          isOpen: true, 
          message: 'Gagal mengambil session. Silakan coba lagi.', 
          type: 'error' 
        });
        toast.error('Gagal mengambil session');
        setSubmitting(false);
        return;
      }

      toast.success('Login berhasil');
      setAlert({ 
        isOpen: true, 
        message: 'Login berhasil! Mengalihkan...', 
        type: 'success' 
      });
      
      router.refresh();

      // Redirect setelah alert ditutup
      setTimeout(() => {
        if (session.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (session.user.role === 'member') {
          router.push('/dashboard/member');
        } else if (session.user.role === 'guest') {
          router.push('/');
        } else {
          setAlert({ 
            isOpen: true, 
            message: 'Akses ditolak. Role tidak valid.', 
            type: 'warning' 
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setAlert({ 
        isOpen: true, 
        message: 'Terjadi kesalahan koneksi. Silakan coba lagi.', 
        type: 'error' 
      });
      toast.error('Terjadi kesalahan koneksi');
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

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

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Masuk...' : 'Login'}
          </button>
        </form>

        <div className="flex items-center justify-center mt-4">
          <button
            onClick={() => signIn('google', { callbackUrl: '/login' })}
            className="flex items-center gap-2 px-8 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition"
          >
            <FcGoogle />
            Login with Google
          </button>
        </div>

        <Link href="/register" className="block text-center text-sm mt-4 text-blue-400 hover:underline">
          Or Register
        </Link>
      </div>

      {/* Custom Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ isOpen: false, message: '', type: 'info' })}
      />
    </div>
  );
}
