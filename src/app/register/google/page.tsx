'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import Alert from "../../components/Alert";

function GoogleRegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [googleData, setGoogleData] = useState<{ email: string; name: string; avatar: string } | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"" | "Weak" | "Medium" | "Strong">("");
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ 
    isOpen: false, 
    message: '', 
    type: 'info' 
  });
  const [submitting, setSubmitting] = useState(false);

  // Ambil data Google dari query params, cookie, atau session
  useEffect(() => {
    const fetchGoogleData = async () => {
      try {
        // Cek query params dulu (dari callback Google)
        const email = searchParams.get("email");
        const name = searchParams.get("name");
        const avatar = searchParams.get("avatar");
        const error = searchParams.get("error");
        const register = searchParams.get("register");

        // Jika ada error dan register=true, berarti user belum terdaftar
        // Kita perlu mendapatkan data Google dari session atau cookie
        if (error === "not_registered" && register === "true") {
          // Coba ambil dari cookie
          const response = await fetch("/api/get-google-data");
          if (response.ok) {
            const data = await response.json();
            if (data.email && data.name) {
              setGoogleData(data);
              setLoading(false);
              return;
            }
          }
          
          // Jika tidak ada di cookie, redirect ke register untuk mulai ulang
          setAlert({
            isOpen: true,
            message: "Data Google tidak ditemukan. Silakan register dengan Google terlebih dahulu.",
            type: "error",
          });
          setTimeout(() => {
            router.push("/register");
          }, 2000);
          return;
        }

        // Jika ada data di query params
        if (email && name) {
          setGoogleData({ email, name, avatar: avatar || "" });
          setLoading(false);
          return;
        }

        // Cek cookie sebagai fallback
        const response = await fetch("/api/get-google-data");
        if (response.ok) {
          const data = await response.json();
          if (data.email && data.name) {
            setGoogleData(data);
            setLoading(false);
            return;
          }
        }

        // Jika tidak ada data Google, redirect ke register
        setAlert({
          isOpen: true,
          message: "Data Google tidak ditemukan. Silakan register dengan Google terlebih dahulu.",
          type: "error",
        });
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      } catch (error) {
        console.error("Error fetching Google data:", error);
        setAlert({
          isOpen: true,
          message: "Terjadi kesalahan. Silakan coba lagi.",
          type: "error",
        });
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      }
    };

    fetchGoogleData();
  }, [searchParams, router]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (value.length < 6) {
      setPasswordStrength("Weak");
    } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value)) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Medium");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !address) {
      setAlert({
        isOpen: true,
        message: "Mohon lengkapi semua field yang diperlukan.",
        type: "warning",
      });
      return;
    }

    if (!googleData) {
      setAlert({
        isOpen: true,
        message: "Data Google tidak ditemukan. Silakan coba lagi.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/register-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email: googleData.email,
          avatar: googleData.avatar,
          address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert({
          isOpen: true,
          message: data.message || "Gagal mendaftar akun Google",
          type: "error",
        });
        toast.error(data.message || "Gagal mendaftar akun Google");
        setSubmitting(false);
        return;
      }

      setAlert({
        isOpen: true,
        message: "Registrasi Google berhasil! Mengalihkan ke login...",
        type: "success",
      });
      toast.success("Registrasi Google berhasil!");

      // Hapus cookie Google data
      document.cookie = "googleRegisterData=; path=/; max-age=0";

      // Redirect ke login setelah 1.5 detik
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Register Google error:", error);
      setAlert({
        isOpen: true,
        message: "Terjadi kesalahan. Silakan coba lagi.",
        type: "error",
      });
      toast.error("Terjadi kesalahan");
      setSubmitting(false);
    }
  };

  if (loading || !googleData) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-center bg-cover">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          Complete Google Registration
        </h1>

        {/* GOOGLE INFO CARD */}
        <div className="text-center mb-6">
          <img
            src={googleData.avatar || "/defaultavatar.png"}
            alt={googleData.name}
            className="w-20 h-20 rounded-full mx-auto ring-2 ring-white/50"
          />
          <p className="font-semibold mt-2">{googleData.name}</p>
          <p className="text-gray-300 text-sm">{googleData.email}</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm mb-1">Username</p>
            <input
              type="text"
              placeholder="Create a username"
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <p className="text-sm mb-1">Password</p>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />

            {passwordStrength && (
              <p
                className={`text-xs mt-1 font-semibold ${
                  passwordStrength === "Strong"
                    ? "text-green-400"
                    : passwordStrength === "Medium"
                    ? "text-yellow-300"
                    : "text-red-400"
                }`}
              >
                Password Strength: {passwordStrength}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm mb-1">Address</p>
            <input
              type="text"
              placeholder="Enter your address"
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Mendaftar..." : "Register"}
          </button>
        </form>
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

export default function GoogleRegisterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <GoogleRegisterPageContent />
    </Suspense>
  );
}
