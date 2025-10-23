'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Loading from '../components/Loading';

interface User {
  _id: string;
  username: string;
  address: string;
  role: string;
  avatar: string;
}

interface Stats {
  totalPoints: number;
  totalEvents: number;
  totalBusinesses: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Ambil data user & stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setUser(userData.user);

        const statsRes = await fetch(`/api/members/dashboard-stats?userId=${userData.user._id}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  function getAvatarSrc(avatar?: string | null) {
    if (!avatar) return "/defaultavatar.png";
    if (avatar.startsWith("data:image")) return avatar;
    if (avatar.startsWith("http") || avatar.startsWith("//")) return avatar;
    if (avatar.startsWith("/")) return avatar;
    return `/uploads/${avatar}`;
  }

  const avatarSrc = getAvatarSrc(user?.avatar);

  if (loading) return <Loading />;

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-gray-400 text-lg">
        User not found.
      </div>
    );


  return (
    <section className="min-h-screen bg-gradient-to-b from-stone-950 to-red-950 text-white flex flex-col items-center py-30 px-6">
      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-36 h-36 mb-6">
          <Image
            src={
              avatarSrc
            }
            alt="User Avatar"
            fill
            unoptimized
            className="rounded-full object-cover border-4 border-red-600 shadow-lg"
          />



        </div>

        <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
        <p className="text-gray-300">{user.address || "No address provided"}</p>
        <span className="text-xs bg-red-800/40 px-3 py-1 rounded-full mt-2 uppercase tracking-wide">
          {user.role}
        </span>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl"
        >
          <div className="bg-gray-900/70 p-6 rounded-xl text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition">
            <p className="text-gray-400 text-sm mb-2">Total Event Participation</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.totalEvents ?? 0}
            </p>
          </div>
          <div className="bg-gray-900/70 p-6 rounded-xl text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition">
            <p className="text-gray-400 text-sm mb-2">Total Business</p>
            <p className="text-2xl font-bold text-blue-400">
              {stats.totalBusinesses ?? 0}
            </p>
          </div>
          <div className="bg-gray-900/70 p-6 rounded-xl text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition">
            <p className="text-gray-400 text-sm mb-2">Total Points</p>
            <p className="text-2xl font-bold text-yellow-400">
              ⭐ {stats.totalPoints ?? 0}
            </p>
          </div>
        </motion.div>
      )}

      {/* Link to Settings */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12"
      >
        <a
          href="/profilesetting"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition shadow-md hover:shadow-lg"
        >
          Edit Profile
        </a>
      </motion.div>
    </section>
  );
}
