"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import Alert from "../components/Alert";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, message: '', type: 'info' })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUser(data.user);
        setUsername(data.user.username || "");
        setAddress(data.user.address || "");
        setAvatarPreview(
          data.user.avatar ? `/uploads/${data.user.avatar}` : null
        );
      } catch (err) {
        console.error(err);
        setAlert({ isOpen: true, message: "Failed to fetch user data", type: 'error' })
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return; // ⛔ stop kalau tidak ada file (hindari Invalid URL)

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleResetAvatar = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          username,
          address,
          avatar: null, // reset avatar ke default
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Reset failed:", data);
        setAlert({ isOpen: true, message: data.message || "Failed to reset avatar", type: 'error' })
        return
      }

      setAlert({ isOpen: true, message: "Avatar reset to default!", type: 'success' })
      setUser(data.user);
      setAvatarPreview(null);
    } catch (err) {
      console.error("Reset error:", err);
      setAlert({ isOpen: true, message: "Server error, see console", type: 'error' })
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?._id) {
      setAlert({ isOpen: true, message: "User not found", type: 'error' })
      return
    }

    setLoading(true);
    try {
      let avatarBase64: string | null = avatarPreview;

      if (avatarFile) {
        avatarBase64 = await toBase64(avatarFile);
      } else if (!avatarPreview?.startsWith("data:image")) {
        avatarBase64 = null;
      }

      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          username,
          address,
          avatar: avatarBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Update failed:", data);
        setAlert({ isOpen: true, message: data.message || "Failed to update profile", type: 'error' })
        return
      }

      setAlert({ isOpen: true, message: "Profile updated successfully!", type: 'success' })
      setUser(data.user);
      setTimeout(() => router.push("/profile"), 1500);
    } catch (err) {
      console.error("Update error:", err);
      setAlert({ isOpen: true, message: "Server error, see console", type: 'error' })
    } finally {
      setLoading(false);
    }
  };

  function getAvatarSrc(avatar?: string | null) {
  if (!avatar) return "/defaultavatar.png";
  if (avatar.startsWith("data:image")) return avatar;
  if (avatar.startsWith("http") || avatar.startsWith("//")) return avatar;
  if (avatar.startsWith("/")) return avatar;
  return `/uploads/${avatar}`;
}

const avatarSrc = getAvatarSrc(user?.avatar);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-red-950 text-white flex flex-col items-center px-6 py-16">
      <div className="max-w-2xl w-full bg-gray-900/80 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          PROFILE SETTINGS
        </h1>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-3">
            <Image
              src={avatarPreview || avatarSrc ||"/defaultavatar.png"}
              alt="User Avatar"
              fill
              className="rounded-full object-cover border-4 border-red-600 shadow-lg"
            />
          </div>
          <label className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition">
            Change Avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>

          {/* Reset Avatar Button */}
          <button
            onClick={handleResetAvatar}
            className="mt-3 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
          >
            Reset to Default
          </button>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-red-600 outline-none"
            placeholder="Enter new username"
          />
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-red-600 outline-none"
            placeholder="Enter your address"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 font-semibold py-3 rounded-lg transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* Cancel */}
        <button
          onClick={() => router.push("/profile")}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white mt-3 py-3 rounded-lg transition"
        >
          Cancel
        </button>
      </div>

      {/* Custom Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ isOpen: false, message: '', type: 'info' })}
      />
    </div>
  );
}
