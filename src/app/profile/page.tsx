// src/app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const router = useRouter()
  const { status } = useSession()

  const [profile, setProfile] = useState<{
    username: string
    emailOrPhone: string
    address: string
    role: string
    profileImage?: string
  } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/user-profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        console.error('Failed to load profile')
      }
    }

    if (status === 'authenticated') fetchProfile()
  }, [status])

  if (status === 'loading') {
    return <div className="text-white text-center">Loading...</div>
  }

  if (!profile) {
    return <div className="text-white text-center">No profile data.</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white flex items-center justify-center px-4 py-10">
      <div className="bg-stone-800 p-8 rounded-xl shadow-xl w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="flex justify-center">
          <img
            src={profile.profileImage || '/defaultavatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border aspect-square"
          />
        </div>

        <div className="text-left space-y-2 text-sm">
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.emailOrPhone || '-'}</p>
          <p><strong>Address:</strong> {profile.address}</p>
          <p><strong>Role:</strong> {profile.role}</p>
        </div>

        <button
          onClick={() => router.push('/profilesetting')}
          className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-red-600 hover:text-white transition"
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}
