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
  const [googleData, setGoogleData] = useState<{ email: string; name: string; avatar: string; googleId: string } | null>(null);
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [alert, setAlert] = useState({ isOpen: false, message: '', type: 'info' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const email = searchParams.get("email");
        const name = searchParams.get("name");
        const avatar = searchParams.get("avatar");
        const googleId = searchParams.get("googleId");
        const error = searchParams.get("error");
        const register = searchParams.get("register");

        if (error === "not_registered" && register === "true") {
          const res = await fetch("/api/get-google-data");
          if (res.ok) {
            const data = await res.json();
            setGoogleData(data);
            setLoading(false);
            return;
          }
          router.push("/register");
          return;
        }

        if (email && name && googleId) {
          setGoogleData({ email, name, avatar: avatar || "", googleId });
          setLoading(false);
          return;
        }

        const res = await fetch("/api/get-google-data");
        if (res.ok) {
          const data = await res.json();
          setGoogleData(data);
          setLoading(false);
          return;
        }

        router.push("/register");
      } catch {
        router.push("/register");
      }
    };

    loadData();
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !address) {
      setAlert({ isOpen: true, message: "Mohon lengkapi semua field.", type: "warning" });
      return;
    }

    if (!googleData) {
      setAlert({ isOpen: true, message: "Data Google tidak ditemukan.", type: "error" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/register-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: googleData.googleId,
          username,
          email: googleData.email,
          avatar: googleData.avatar,
          address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitting(false);
        setAlert({ isOpen: true, message: data.message || "Terjadi kesalahan saat registrasi.", type: "error" });
        toast.error(data.message || "Terjadi kesalahan");
        return;
      }

      toast.success("Registrasi Google berhasil!");

      // Clear Google data cookie
      document.cookie = "googleRegisterData=; path=/; max-age=0";

      // Redirect to email verification page
      if (data.redirect) {
        setTimeout(() => {
          router.push(data.redirect);
        }, 1200);
      } else {
        // Fallback redirect
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(googleData.email)}`);
        }, 1200);
      }
    } catch {
      toast.error("Terjadi kesalahan.");
      setSubmitting(false);
    }
  };

  if (loading || !googleData) return <Loading />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-center bg-cover">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-center mb-6">Complete Google Registration</h1>

        <div className="text-center mb-6">
          <img
            src={googleData.avatar || "/defaultavatar.png"}
            alt={googleData.name}
            className="w-20 h-20 rounded-full mx-auto ring-2 ring-white/50"
          />
          <p className="font-semibold mt-2">{googleData.name}</p>
          <p className="text-gray-300 text-sm">{googleData.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm mb-1">Username</p>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <p className="text-sm mb-1">Address</p>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white outline-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-full bg-white text-black font-bold transition disabled:opacity-50"
          >
            {submitting ? "Mendaftar..." : "Register"}
          </button>
        </form>
      </div>
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
