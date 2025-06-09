'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-50 backdrop-blur-md shadow-md px-6 py-4 text-white">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-red-500">Home</Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="hover:text-red-500 focus:outline-none"
            >
              Menu ▾
            </button>
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-black bg-opacity-80 rounded shadow-lg w-40">
                <Link
                  href="/business"
                  className="block px-4 py-2 hover:bg-red-600 rounded-t"
                  onClick={() => setMenuOpen(false)}
                >
                  Business Page
                </Link>
                <Link
                  href="#activities"
                  className="block px-4 py-2 hover:bg-red-600 rounded-b"
                  onClick={() => setMenuOpen(false)}
                >
                  Activities
                </Link>
              </div>
            )}
          </div>
        </div>

        <img src="/logo.png" alt="Spartan Logo" className="h-12 mx-auto absolute left-1/2 transform -translate-x-1/2" />

        <div className="ml-auto">
          <Link href="/login" className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700">Sign Up</Link>
        </div>
      </div>
    </nav>
  )
}
