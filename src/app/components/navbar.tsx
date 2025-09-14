'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as { username: string; email: string; role?: string } | undefined;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }

      if (
        profileRef.current && !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-50 backdrop-blur-md shadow-md px-6 py-4 text-white">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <Link href="/" className="transition active:scale-90 hover:text-red-500">Home</Link>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="transition active:scale-90 hover:text-red-500 focus:outline-none">
              Menu ▾
            </button>
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-black bg-opacity-80 rounded shadow-lg w-40 z-50">
                <Link href="/business" className="block px-4 py-2 hover:bg-red-600">Business Page</Link>
                {user?.role === 'guest' && (
                  <>
                  <Link href="/forum" className="block px-4 py-2 hover:bg-red-600">Forum</Link>
                  </>
                )}
                {user?.role === 'member' && (
                  <>
                    <Link href="/forum" className="block px-4 py-2 hover:bg-red-600">Forum</Link>
                    <Link href="/gallery" className="block px-4 py-2 hover:bg-red-600">Gallery</Link>
                    <Link href="/finance" className="block px-4 py-2 hover:bg-red-600">Finance</Link>
                    <Link href="/eventschedule" className="block px-4 py-2 hover:bg-red-600">Event Schedule</Link>  
                  </>
                )}
                {user?.role === 'admin' && (
                  <>
                  <Link href="/forum" className="block px-4 py-2 hover:bg-red-600">Forum</Link>
                  <Link href="/gallery" className="block px-4 py-2 hover:bg-red-600">Gallery</Link>
                    <Link href="/finance" className="block px-4 py-2 hover:bg-red-600">Finance</Link>
                    <Link href="/eventschedule" className="block px-4 py-2 hover:bg-red-600">Event Schedule</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <Image
          src="/logospartannew.png"
          alt="Spartan Logo"
          width={100}
          height={50}
          className="h-12 mx-auto absolute left-1/2 transform -translate-x-1/2"
        />
        {!user ? (
          <div className="ml-auto">
            <Link href="/login" className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700">Sign In</Link>
          </div>
        ) : (
          <div className="relative ml-auto" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              className="w-10 h-10 rounded-full overflow-hidden border border-white">
              <Image src="/spartanbg.jpeg" alt="avatar" width={40} height={40} className="rounded-full" />
            </button>
            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-black text-white rounded shadow-md z-50">
                <Link href="/profile" className="block px-4 py-2 hover:bg-red-600">Profile</Link>
                <Link href="/inbox" className="block px-4 py-2 hover:bg-red-600">Inbox</Link>
                {user.role === 'member' && <Link href="/dashboard/member" className="block px-4 py-2 hover:bg-red-600">Dashboard Member</Link>}
                {user.role === 'admin' && <Link href="/dashboard/admin" className="block px-4 py-2 hover:bg-red-600">Dashboard Admin</Link>}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="block w-full text-left text-red-500 px-4 py-2 hover:bg-red-600 hover:text-white">
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
