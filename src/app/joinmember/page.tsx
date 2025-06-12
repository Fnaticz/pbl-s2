'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function JoinMemberPage() {
    const [agreed, setAgreed] = useState(false)

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
            <main className="flex-grow pt-20 px-4 pb-16">
                <h1 className="text-3xl font-bold mb-6 text-center">Join Spartan Offroad Community</h1>

                <img
                    src="/event.jpg"
                    alt="Spartan Picture"
                    className="w-full rounded-lg mb-6 shadow-lg"
                />

                <p className="text-lg mb-4">
                    Welcome to Spartan Offroad Community! We are a group of passionate adventurers who explore the world off the beaten path.
                    Join us to take part in epic trail rides, outdoor activities, and community-driven events.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Terms & Conditions</h2>
                <ul className="list-disc list-inside text-gray-300 mb-4">
                    <li>Must be at least 18 years old to join.</li>
                    <li>Commit to respect fellow members and the environment.</li>
                    <li>Follow safety rules during all activities.</li>
                    <li>Membership is subject to approval by the admin.</li>
                </ul>

                <label className="flex items-center gap-2 mb-6">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="accent-red-600 w-5 h-5"
                    />
                    <span className="text-sm">I agree to the Terms & Conditions</span>
                </label>

                {agreed ? (
                    <a
                        href="/memregistform"
                        className="block w-full py-3 rounded text-white font-semibold text-center bg-red-600 hover:bg-red-700 transition-colors"
                    >
                        Join Now
                    </a>
                ) : (
                    <button
                        disabled
                        className="w-full py-3 rounded text-white font-semibold transition-colors bg-gray-600 cursor-not-allowed"
                    >
                        Join Now
                    </button>
                )}

            </main>
        </div>
    )
}
