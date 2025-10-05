"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Loading from "../components/Loading";

type FormData = {
  driverName: string;
  coDriverName: string;
  carName: string;
  driverPhone: string;
  coDriverPhone: string;
  policeNumber: string;
  address: string;
  teamName: string;
  paymentStatus: string;
  paymentProof?: string; // base64 bukti transaksi
};

export default function RegisterEventPage() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    driverName: "",
    coDriverName: "",
    carName: "",
    driverPhone: "",
    coDriverPhone: "",
    policeNumber: "",
    address: "",
    teamName: "",
    paymentStatus: "unpaid",
    paymentProof: "",
  });
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const { data: session } = useSession();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, paymentProof: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.id) {
      alert("Login required to register.");
      return;
    }

    if (!isPaid) {
      alert("Anda harus mencentang checkbox pembayaran terlebih dahulu.");
      return;
    }

    const payload = {
      userId: session.user.id,
      ...formData,
    };

    try {
      const res = await fetch("/api/events/event-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Event registration submitted!");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to register event");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-950 to-red-950 py-16 px-6">
      <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-5xl p-8 flex flex-col md:flex-row gap-8">
        
        {/* Form Input (Kiri) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-4">Data Registrasi</h2>

          <label>
            Nama Driver
            <textarea
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Nama Co-Driver
            <textarea
              name="coDriverName"
              value={formData.coDriverName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Nama Mobil
            <textarea
              name="carName"
              value={formData.carName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Nomor HP Driver
            <textarea
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Nomor HP Co-Driver
            <textarea
              name="coDriverPhone"
              value={formData.coDriverPhone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Nomor Plat Mobil
            <textarea
              name="policeNumber"
              value={formData.policeNumber}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Alamat
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Nama Team
            <textarea
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <label>
            Bukti Transaksi QRIS
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-3 rounded-lg bg-stone-800 focus:outline-none"
              required
            />
          </label>

          <button
            type="submit"
            disabled={!isPaid}
            className={`mt-4 px-4 py-3 rounded-lg font-semibold transition ${
              isPaid
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            Submit Registration
          </button>
        </form>

        {/* Payment QRIS (Kanan) */}
        <div className="flex-1 bg-stone-900 p-6 rounded-lg flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3">Pembayaran via QRIS</h3>
          <Image
            src="/qris.jpg"
            alt="QRIS Spartan Payment"
            width={250}
            height={250}
            className="mx-auto mb-4"
          />
          <p className="text-gray-300 text-sm text-center mb-4">
            Silakan scan QR untuk pembayaran pendaftaran event.
          </p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => {
                setIsPaid(e.target.checked);
                setFormData((prev) => ({
                  ...prev,
                  paymentStatus: e.target.checked ? "paid" : "unpaid",
                }));
              }}
            />
            <span className="text-sm">Saya sudah melakukan pembayaran</span>
          </label>
        </div>
      </div>
    </section>
  );
}
