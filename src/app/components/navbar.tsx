'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { username: string; role: 'guest' | 'member' | 'admin' } | undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuProfile, setMenuProfile] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setMenuProfile(false);
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-50 backdrop-blur-md shadow-md px-6 py-4 text-white">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <Link href="/" className="transition active:scale-95 hover:text-red-500">Home</Link>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="transition active:scale-95 hover:text-red-500">
              Menu ▾
            </button>
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-black bg-opacity-80 rounded shadow-lg w-40">
                <Link href="/business" className="block px-4 py-2 hover:bg-red-600" onClick={() => setMenuOpen(false)}>Business Page</Link>
                {user && (
                  <>
                    <Link href="/forum" className="block px-4 py-2 hover:bg-red-600" onClick={() => setMenuOpen(false)}>Forum Page</Link>
                    {user.role === 'member' && (
                      <>
                        <Link href="/finance" className="block px-4 py-2 hover:bg-red-600" onClick={() => setMenuOpen(false)}>Finance Page</Link>
                        <Link href="/eventschedule" className="block px-4 py-2 hover:bg-red-600" onClick={() => setMenuOpen(false)}>Event Schedule</Link>
                        <Link href="/gallery" className="block px-4 py-2 hover:bg-red-600" onClick={() => setMenuOpen(false)}>Gallery</Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link href="/finance" className="block px-4 py-2 hover:bg-red-600" onClick={() => setMenuOpen(false)}>Finance Page</Link>
                        <Link href="/eventschedule" className="block px-4 py-2 hover:bg-red-600" onClick={() => setMenuOpen(false)}>Event Schedule</Link>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Image
          src="/logo.png"
          alt="Spartan Logo"
          width={48}
          height={48}
          className="h-12 mx-auto absolute left-1/2 transform -translate-x-1/2"
        />
        {!user ? (
          <div className="ml-auto">
            <Link href="/login" className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition">Sign Up</Link>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuProfile(!menuProfile)}
              className="w-10 h-10 rounded-full overflow-hidden border border-white transition"
            >
              <img src="/spartanbg.jpeg" alt="avatar" className="w-10 h-10 rounded-full" />
            </button>
            {menuProfile && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-black text-white rounded shadow-md">
                <Link href="/profile" className="block px-4 py-2 hover:bg-red-600">Profile</Link>
                <Link href="/inbox" className="block px-4 py-2 hover:bg-red-600">Inbox</Link>
                {user.role === 'admin' && (
                  <Link href="/dashboard/admin" className="block px-4 py-2 hover:bg-red-600">Dashboard Admin</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-red-500 px-4 py-2 hover:bg-red-600 hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
