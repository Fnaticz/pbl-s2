'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSession } from 'next-auth/react'
import Loading from '../components/Loading'
import Alert from '../components/Alert'
import { FcGoogle } from 'react-icons/fc'
import { signIn } from 'next-auth/react'
import { toast } from 'react-toastify'

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    emailOrPhone: '',
    password: '',
    address: '',
  });

  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ 
    isOpen: false, 
    message: '', 
    type: 'info' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] =
    useState<'Weak' | 'Medium' | 'Strong' | ''>('');

  // CHECK SESSION - Redirect jika sudah login
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session || !session.user) {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
      }

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

  // Handle Google error dari login
  useEffect(() => {
    const googleError = searchParams.get("google_error");
    if (googleError === "not_registered") {
      setAlert({
        isOpen: true,
        message: "Akun Google belum terdaftar. Silakan lengkapi form registrasi di bawah atau gunakan tombol Register with Google.",
        type: "warning",
      });
      toast.warning("Akun Google belum terdaftar. Silakan lengkapi registrasi.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      if (value.length < 6) {
        setPasswordStrength('Weak');
      } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value)) {
        setPasswordStrength('Strong');
      } else {
        setPasswordStrength('Medium');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { username, emailOrPhone, password, address } = formData;

    // Validasi input
    if (!username || !emailOrPhone || !password || !address) {
      setAlert({ 
        isOpen: true, 
        message: 'Mohon lengkapi semua field sebelum submit.', 
        type: 'warning' 
      });
      return;
    }

    // Validasi format email atau phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\-\s()]+$/;
    const isEmail = emailRegex.test(emailOrPhone);
    const isPhone = phoneRegex.test(emailOrPhone) && emailOrPhone.replace(/\D/g, '').length >= 10;

    if (!isEmail && !isPhone) {
      setAlert({ 
        isOpen: true, 
        message: 'Format email atau nomor telepon tidak valid.', 
        type: 'error' 
      });
      return;
    }

    // Validasi password
    if (password.length < 6) {
      setAlert({ 
        isOpen: true, 
        message: 'Password minimal 6 karakter.', 
        type: 'error' 
      });
      return;
    }

    setSubmitting(true);

    try {
      // Cek apakah email atau phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(emailOrPhone);

      // Jika email, kirim kode verifikasi terlebih dahulu
      if (isEmail) {
        const sendCodeRes = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailOrPhone }),
        });

        const sendCodeData = await sendCodeRes.json();
        
        if (!sendCodeRes.ok && !sendCodeData.error?.includes('DEV MODE')) {
          setAlert({
            isOpen: true,
            message: sendCodeData.message || 'Gagal mengirim kode verifikasi. Silakan coba lagi.',
            type: 'error',
          });
          setSubmitting(false);
          return;
        }
      }

      // Lanjutkan registrasi
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          emailOrPhone,
          password,
          address,
          role: 'guest',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect ke halaman verifikasi email jika email valid
        if (isEmail) {
          router.push(`/verify-email?email=${encodeURIComponent(emailOrPhone)}`);
        } else {
          // Jika bukan email (phone), langsung set submitted
          setSubmitted(true);
          setAlert({ 
            isOpen: true, 
            message: data.message || 'Registrasi berhasil!', 
            type: 'success' 
          });
        }
      } else {
        setAlert({ 
          isOpen: true, 
          message: data.message || 'Terjadi kesalahan. Silakan coba lagi.', 
          type: 'error' 
        });
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Register error:', error);
      setAlert({ 
        isOpen: true, 
        message: 'Terjadi kesalahan koneksi. Silakan coba lagi.', 
        type: 'error' 
      });
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

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
                disabled={submitting}
                className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Mendaftar...' : 'Register'}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/register/google?register=true",
                  })
                }
                className="flex items-center gap-2 px-8 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition"
              >
                <FcGoogle />
                Register with Google
              </button>
            </div>
          </>
        )}

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

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RegisterPageContent />
    </Suspense>
  );
}
