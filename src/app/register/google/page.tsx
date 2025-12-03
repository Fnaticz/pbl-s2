'use client';

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";

export default function GoogleRegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] =
    useState<"" | "Weak" | "Medium" | "Strong">("");

  // Jika user tidak datang dari Google Register → redirect ke /register
  useEffect(() => {
    if (!session?.googleRegister) {
      router.push("/register");
    }
  }, [session, router]);

  if (!session?.googleRegister) {
    return <Loading />;
  }

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/register-google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        email: session.googleRegister.email,
        avatar: session.googleRegister.avatar,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Gagal mendaftar akun Google");
      return;
    }

    toast.success("Registrasi Google berhasil! Login otomatis...");

    // Setelah register, login ulang pakai Google
    setTimeout(() => {
      signIn("google");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-center bg-cover">
      <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md text-white">

        <h1 className="text-3xl font-bold text-center mb-6">
          Complete Google Registration
        </h1>

        {/* GOOGLE INFO CARD */}
        <div className="text-center mb-6">
          <img
            src={session.googleRegister.avatar}
            className="w-20 h-20 rounded-full mx-auto ring-2 ring-white/50"
          />
          <p className="font-semibold mt-2">{session.googleRegister.name}</p>
          <p className="text-gray-300 text-sm">{session.googleRegister.email}</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm mb-1">Username</p>
            <input
              type="text"
              placeholder="Create a username"
              className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none"
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

          <button
            type="submit"
            className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
