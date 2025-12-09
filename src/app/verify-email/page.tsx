'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ 
    isOpen: false, 
    message: '', 
    type: 'info' 
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    setLoading(false);
  }, [searchParams]);

  const handleSendCode = async () => {
    if (!email) {
      setAlert({
        isOpen: true,
        message: 'Mohon masukkan email terlebih dahulu.',
        type: 'warning',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlert({
        isOpen: true,
        message: 'Format email tidak valid.',
        type: 'error',
      });
      return;
    }

    setSending(true);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAlert({
          isOpen: true,
          message: 'Kode verifikasi telah dikirim ke email Anda. Silakan cek inbox atau spam folder.',
          type: 'success',
        });
        toast.success('Kode verifikasi telah dikirim');
      } else {
        // In development, show the code if provided
        if (data.error && data.error.includes('DEV MODE')) {
          setAlert({
            isOpen: true,
            message: `Kode verifikasi (Dev Mode): ${data.error.split('Code: ')[1]?.split(',')[0] || 'Tidak tersedia'}`,
            type: 'info',
          });
          toast.info('Kode verifikasi (Dev Mode)');
        } else {
          setAlert({
            isOpen: true,
            message: data.message || 'Gagal mengirim kode verifikasi. Silakan coba lagi.',
            type: 'error',
          });
          toast.error(data.message || 'Gagal mengirim kode verifikasi');
        }
      }
    } catch (error) {
      console.error('Send verification error:', error);
      setAlert({
        isOpen: true,
        message: 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error',
      });
      toast.error('Terjadi kesalahan');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      setAlert({
        isOpen: true,
        message: 'Mohon lengkapi email dan kode verifikasi.',
        type: 'warning',
      });
      return;
    }

    setVerifying(true);

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        setAlert({
          isOpen: true,
          message: 'Email berhasil diverifikasi! Mengalihkan ke login...',
          type: 'success',
        });
        toast.success('Email berhasil diverifikasi!');
        
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setAlert({
          isOpen: true,
          message: data.message || 'Kode verifikasi tidak valid atau sudah kedaluwarsa.',
          type: 'error',
        });
        toast.error(data.message || 'Kode verifikasi tidak valid');
        setVerifying(false);
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setAlert({
        isOpen: true,
        message: 'Terjadi kesalahan. Silakan coba lagi.',
        type: 'error',
      });
      toast.error('Terjadi kesalahan');
      setVerifying(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-center bg-cover">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-center mb-6">Verifikasi Email</h1>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-300">
            Kami telah mengirimkan kode verifikasi ke email Anda. Silakan masukkan kode tersebut di bawah ini.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="code" className="block text-sm">Kode Verifikasi</label>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sending}
                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                {sending ? 'Mengirim...' : 'Kirim ulang kode'}
              </button>
            </div>
            <input
              id="code"
              type="text"
              placeholder="Masukkan 6 digit kode"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none text-center text-2xl tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? 'Memverifikasi...' : 'Verifikasi Email'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Kembali ke Login
          </button>
        </div>
      </div>

      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ isOpen: false, message: '', type: 'info' })}
      />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

