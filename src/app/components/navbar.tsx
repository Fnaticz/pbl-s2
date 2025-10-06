'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const user = session?.user as { username: string; email: string; role?: string; avatar?: string; } | undefined;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        update();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [status, update]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setAvatar(data.user.avatar);
        } else {
          setAvatar(null);
        }
      } catch (err) {
        console.error("Failed to fetch avatar:", err);
        setAvatar(null);
      }
    };

    if (status === "authenticated") {
      fetchUser();
    } else if (status === "unauthenticated") {
      setAvatar(null); // reset kalau logout
    }
  }, [status]);

  function getAvatarSrc(avatar?: string | null) {
    if (!avatar) return "/defaultavatar.png";
    if (avatar.startsWith("data:image")) return avatar;
    if (avatar.startsWith("http") || avatar.startsWith("//")) return avatar;
    if (avatar.startsWith("/")) return avatar;
    return `/uploads/${avatar}`;
  }

  const avatarSrc = getAvatarSrc(avatar);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${scrolled ? 'bg-black shadow-md' : 'bg-transparent'
        }`}
    >
      <div className="flex items-center justify-between px-6 py-4 text-white">
        {/* Logo di kiri */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logospartannew.png"
            alt="Spartan Logo"
            width={150}
            height={70}
            className="h-15"
          />
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8 ml-auto">
          <Link href="/" className="hover:text-red-500 transition">
            Home
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="hover:text-red-500 transition"
            >
              Menu ▾
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 bg-black bg-opacity-90 rounded shadow-lg w-40 z-50"
                >
                  <Link href="/business" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Member Business</Link>
                  {user?.role === 'guest' && (
                    <Link href="/forum" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Forum</Link>
                  )}
                  {user?.role === 'member' && (
                    <>
                      <Link href="/forum" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Forum</Link>
                      <Link href="/gallery" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Gallery</Link>
                      <Link href="/finance" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Finance Report</Link>
                      <Link href="/eventschedule" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Event Schedule</Link>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link href="/forum" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Forum</Link>
                      <Link href="/gallery" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Gallery</Link>
                      <Link href="/finance" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Finance</Link>
                      <Link href="/eventschedule" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-red-600">Event Schedule</Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Profile / Signin Desktop */}
        {!user ? (
          <div className="hidden md:block ml-20">
            <Link href="/login" className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700">Sign In</Link>
          </div>
        ) : (
          <div className="hidden md:block relative ml-20" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              className="w-10 h-10 rounded-full overflow-hidden border border-white"
            >
              <Image
                src={avatarSrc}
                alt="avatar"
                width={40}
                height={40}
                unoptimized
                className="rounded-full object-cover"
              />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-black text-white rounded shadow-md z-50"
                >
                  <Link href="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-red-600">Profile</Link>
                  <Link href="/inbox" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-red-600">Inbox</Link>
                  {user.role === 'member' && <Link href="/dashboard/member" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-red-600">Dashboard Member</Link>}
                  {user.role === 'admin' && <Link href="/dashboard/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 hover:bg-red-600">Dashboard Admin</Link>}
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="block w-full text-left text-red-500 px-4 py-2 hover:bg-red-600 hover:text-white"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="md:hidden text-3xl focus:outline-none hover:text-red-500"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 w-2/3 h-screen bg-black bg-opacity-95 z-40 flex flex-col gap-4 p-6 text-white overflow-y-auto max-h-screen"
          >
            <button onClick={() => setMobileOpen(false)} className="text-2xl self-end hover:text-red-500">✕</button>
            {/* Profile Section */}
            <div className="mb-6">
              <h3 className="text-gray-400 uppercase text-sm mb-2">Profile</h3>
              {!user ? (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block mb-2 hover:text-red-500">Sign In</Link>
              ) : (
                <div className="flex flex-col items-center text-center gap-3">
                  <Image
                    src={avatarSrc}
                    alt="avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <p className="font-semibold">{user.username}</p>
                  <div className="flex flex-col gap-2 w-full text-left">
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500">Profile</Link>
                    <Link href="/inbox" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500">Inbox</Link>
                    {user.role === 'member' && (
                      <Link href="/dashboard/member" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500">Dashboard Member</Link>
                    )}
                    {user.role === 'admin' && (
                      <Link href="/dashboard/admin" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500">Dashboard Admin</Link>
                    )}
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/login' });
                        setMobileOpen(false);
                      }}
                      className="border-b border-gray-900 py-2 text-red-500 text-left hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Section */}
            <div className="mb-6">
              <div className="flex flex-col gap-2 w-full text-left">
                <h3 className="text-gray-400 uppercase text-sm mb-2">Menu</h3>
                <Link href="/" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500" >Home</Link>
                <Link href="/business" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500" >Business Page</Link>
                <Link href="/forum" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500" >Forum</Link>
                <Link href="/gallery" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500" >Gallery</Link>
                <Link href="/finance" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500" >Finance</Link>
                <Link href="/eventschedule" onClick={() => setMobileOpen(false)} className="border-b border-gray-900 py-2 hover:text-red-500" >Event Schedule</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
