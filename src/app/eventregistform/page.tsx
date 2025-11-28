"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Loading from "../components/Loading";
import Alert from "../components/Alert";

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
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, message: '', type: 'info' })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const { data: session } = useSession();

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, paymentProof: reader.result as string }));
      e.target.value = ""; // 🔥 reset supaya bisa pilih file yang sama lagi nanti
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, paymentProof: "" }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.id) {
      setAlert({ isOpen: true, message: "Login required to register.", type: 'warning' })
      return;
    }

    if (!isPaid) {
      setAlert({ isOpen: true, message: "Anda harus mencentang checkbox pembayaran terlebih dahulu.", type: 'warning' })
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
        setAlert({ isOpen: true, message: "Event registration submitted!", type: 'success' })
      } else {
        const err = await res.json();
        setAlert({ isOpen: true, message: err.message || "Failed to register event", type: 'error' })
      }
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, message: "Server error. Please try again later.", type: 'error' })
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-950 to-red-950 py-25 px-6">
      <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-5xl p-8 flex flex-col md:flex-row gap-8">

        {/* Form Input (Kiri) */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-4"> 📝 Event Registration Form</h2>

          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Driver Name</label>
            <textarea
              name="driverName"
              placeholder="Driver name"
              value={formData.driverName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Co-Driver Name</label>
            <textarea
              name="coDriverName"
              placeholder="Co-Driver Name"
              value={formData.coDriverName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Car Name</label>
            <textarea
              name="carName"
              placeholder="Car Name"
              value={formData.carName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>


          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Driver Phone Number</label>
            <textarea
              name="driverPhone"
              placeholder="Driver Phone Number"
              value={formData.driverPhone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>


          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Co-Driver Phone Number</label>
            <textarea
              name="coDriverPhone"
              placeholder="Co-Driver Phone Number"
              value={formData.coDriverPhone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>


          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Police Number</label>
            <textarea
              name="policeNumber"
              placeholder="Police Number"
              value={formData.policeNumber}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>


          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Address</label>
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>


          <div className="mb-4">
            <label className="block text-md font-semibold mb-1">
              Team Name</label>
            <textarea
              name="teamName"
              placeholder="Team Name"
              value={formData.teamName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-red-600 outline-none"
              required
            />
          </div>


          {/* UPLOAD PROOF */}
          <div className="mb-4">
            <label className="block text-md font-semibold mb-3">
              Proof of QRIS Transaction
            </label>
            <label
              htmlFor="business-files"
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow inline-block"
            >
              Choose Pictures
            </label>
            <input
              id="business-files"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Preview Image */}
            {formData.paymentProof && (
              <div className="mt-4 relative w-fit">
                <Image
                  src={formData.paymentProof}
                  alt="Payment Proof Preview"
                  width={200}
                  height={200}
                  className="rounded-lg border border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isPaid}
            className={`mt-4 px-4 py-3 rounded-lg font-semibold transition ${isPaid
              ? "bg-red-600 hover:bg-red-700"
              : "bg-stone-800 cursor-not-allowed text-gray-500"
              }`}
          >
            Submit Registration
          </button>
        </form>

        {/* Payment QRIS (Kanan) */}
        <div className="flex-1 bg-gray-900 p-6 rounded-lg flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3">Payment via QRIS</h3>
          <Image
            src="/qrisnew.jpg"
            alt="QRIS Spartan Payment"
            width={250}
            height={250}
            className="mx-auto mb-4"
          />
          <p className="text-gray-300 text-sm text-center mb-4">
            Please scan the QR code for event registration payment.
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
              className="accent-red-600 w-5 h-5"
            />
            <span className="text-sm">I have made the payment</span>
          </label>
        </div>
      </div>

      {/* Custom Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ isOpen: false, message: '', type: 'info' })}
      />
    </section>
  );
}
