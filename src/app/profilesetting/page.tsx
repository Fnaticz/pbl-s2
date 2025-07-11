'use client'

import { useState } from 'react'

export default function ProfileSettingsPage() {
    const [username, setUsername] = useState('')
    const [address, setAddress] = useState('')
    const [profileImage, setProfileImage] = useState<string | null>(null)


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = reader.result?.toString() || null
                setProfileImage(base64)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white flex items-center justify-center px-4 py-10">
            <div className="bg-stone-800 p-6 rounded-xl shadow-lg w-full max-w-md space-y-6">
                <h1 className="text-2xl font-bold text-center">Edit Profile</h1>

                <div className="flex flex-col items-center gap-2">
                    <img
                        src={(!profileImage || profileImage === "null") ? "/defaultavatar.png" : profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border aspect-square"
                    />

                    <div className="w-full flex flex-col items-start mt-2 text-sm">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-white hover:text-red-600"
                        />
                        <button
                            className="text-red-400 hover:text-red-600 text-xs mt-1"
                        >
                            Remove Profile Picture
                        </button>
                    </div>
                </div>


                <div>
                    <label className="block mb-1 text-sm">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 rounded bg-white/20 text-white outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter new username"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm">Address</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 rounded bg-white/20 text-white outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter address"
                    />
                </div>
                <button className="w-full py-2 bg-white text-black font-bold rounded hover:bg-red-600 hover:text-white transition">
                    Save Changes
                </button>
            </div>
        </div>
    )
}
