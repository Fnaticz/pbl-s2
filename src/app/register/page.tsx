'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loading from '../components/Loading'
import { FcGoogle } from 'react-icons/fc'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    emailOrPhone: '',
    password: '',
    address: '',
  });

  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [passwordStrength, setPasswordStrength] =
    useState<'Weak' | 'Medium' | 'Strong' | ''>('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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

    if (!username || !emailOrPhone || !password || !address) {
      setMessage('Please complete all fields before submitting.');
      return;
    }

    setSubmitted(true);

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
    setMessage(data.message || 'Something went wrong');
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
                className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition"
              >
                Register
              </button>

              {message && (
                <p className="text-center text-sm text-red-500 mt-2">
                  {message}
                </p>
              )}
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
    </div>
  );
}
