'use client'

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Business = {
  _id: string;
  name: string;
  description: string;
  category: string;
  coverImage?: string;
};

export default function MemberDashboard() {
  const { data: session } = useSession();
  const user = session?.user as { username: string };
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState({ name: "", description: "", category: "", coverImage: "" });

  // Fetch data business milik user
  useEffect(() => {
    if (user?.username) {
      fetch(`/api/business?owner=${user.username}`)
        .then((res) => res.json())
        .then((data) => setBusinesses(data));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: user.username, ...form }),
    });

    if (res.ok) {
      const newBusiness = await res.json();
      setBusinesses((prev) => [...prev, newBusiness]);
      setForm({ name: "", description: "", category: "", coverImage: "" });
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/business?id=${id}`, { method: "DELETE" });
    setBusinesses((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Businesses</h1>

      <form onSubmit={handleSubmit} className="space-y-2 my-4">
        <input
          className="border p-2 w-full"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 w-full"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Business
        </button>
      </form>

      <div className="grid gap-4">
        {businesses.map((b) => (
          <div key={b._id} className="border p-4 rounded shadow">
            <h2 className="font-semibold">{b.name}</h2>
            <p>{b.description}</p>
            <p className="text-sm text-gray-500">{b.category}</p>
            <button
              onClick={() => handleDelete(b._id)}
              className="text-red-600 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
