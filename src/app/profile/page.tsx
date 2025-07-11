'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        address: '',
        profileImage: '',
    })

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white flex items-center justify-center px-4 py-10">
            <div className="bg-stone-800 p-8 rounded-xl shadow-xl w-full max-w-md text-center space-y-6">
                <h1 className="text-2xl font-bold mb-4">My Profile</h1>

                <div className="flex justify-center">
                    {profile.profileImage ? (
                        <img
                            src={profile.profileImage}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border aspect-square"
                        />
                    ) : (
                        <img
                            src="/defaultavatar.png"
                            alt="Default Avatar"
                            className="w-32 h-32 rounded-full object-cover border aspect-square"
                        />
                    )}
                </div>

                <div className="text-left space-y-2 text-sm">
                    <p><strong>Username:</strong> {profile.username}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Address:</strong> {profile.address}</p>
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
