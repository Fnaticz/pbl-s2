import React from 'react'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/loginbg.png')] bg-cover bg-center">
            <div className="bg-stone-800 bg-opacity-40 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-white text-center mb-6">LOGIN</h1>

                <form className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-white mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Username"
                            className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-white mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 rounded-full bg-white/20 text-white placeholder-white outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 rounded-full bg-white text-black font-bold hover:bg-red-600 hover:text-white transition"
                    >
                        Login
                    </button>
                </form>

                <div className="flex items-center justify-between mt-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition">
                        <img src="/googlelogo.png" className="w-5 h-5" alt="Google" />
                        Google
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition">
                        <img src="/facebooklogo.png" className="w-5 h-5" alt="Facebook" />
                        Facebook
                    </button>
                </div>
                <div><Link href="/register" className="block text-center text-sm mt-4 text-blue-400 hover:underline cursor-pointer">
                    Or Register
                </Link>
                </div>
            </div>
        </div>
    )
}