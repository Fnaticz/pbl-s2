"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Loading from "../../components/Loading";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaTag,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

type Business = {
  _id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  maps?: string;
  slideshow?: string[];
};

type Voucher = {
  _id: string;
  title: string;
  description: string;
  pointsRequired: number;
  expiryDate: string;
  stock: number;
};

export default function BusinessDetailPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params?.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [visibleCount, setVisibleCount] = useState(2)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lastRedeem, setLastRedeem] = useState<Date | null>(null)

  const user = session?.user as { id: string; username: string } | undefined;

  useEffect(() => {
    if (!id) return
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/business/${id}`)
        const data = await res.json()
        setBusiness(data)
        setVouchers(data.vouchers || [])
      } catch (err) {
        console.error('Failed to fetch business:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBusiness()
  }, [id])

  // Handle redeem
  const handleRedeem = async (voucherId: string, pointsRequired: number) => {
    console.log("clicked redeem", voucherId); // 🔍 debug
    if (!session?.user?.id) {
      alert("Please login to redeem");
      return;
    }
    if (!canRedeem()) {
      alert("You can redeem only once every 24 hours!");
      return;
    }
    if (!confirm(`Redeem this voucher for ${pointsRequired} points?`)) return;

    try {
      const res = await fetch("/api/voucher/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId }), // 🔧 IMPORTANT: only voucherId
      });

      const result = await res.json();
      console.log("redeem response", result);

      if (res.ok) {
        alert(`Successfully redeemed ${result.redemption.voucherTitle || "voucher"}!`);
        setLastRedeem(new Date());
        // refresh vouchers/stock
        const r2 = await fetch(`/api/voucher/index?businessId=${id}`);
        if (r2.ok) {
          const d2 = await r2.json();
          setVouchers(d2 || []);
        }
      } else {
        alert(result.message || "Failed to redeem");
      }
    } catch (err) {
      console.error("Redeem error:", err);
      alert("Server error, try again later.");
    }
  };


  // ambil riwayat redeem terakhir
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchLastRedeem = async () => {
      try {
        const res = await fetch("/api/voucher/last-redeem");
        const data = await res.json();
        if (data?.lastRedeemAt) setLastRedeem(new Date(data.lastRedeemAt));
      } catch (err) {
        console.error("Fetch last redeem error:", err);
      }
    };
    fetchLastRedeem();
  }, [session]);

  const canRedeem = () => {
    if (!lastRedeem) return true
    const now = new Date()
    const diff = now.getTime() - lastRedeem.getTime()
    return diff >= 24 * 60 * 60 * 1000 // 1 hari (ms)
  }

  const handlePrev = () => {
    if (!business?.slideshow) return;
    setCurrentSlide((prev) =>
      prev === 0 ? business.slideshow!.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!business?.slideshow) return;
    setCurrentSlide((prev) =>
      prev === business.slideshow!.length - 1 ? 0 : prev + 1
    );
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false
    const exp = new Date(expiryDate)
    const now = new Date()
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 3 && diffDays > 0
  }

  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("/maps/embed")) return url;
    if (url.includes("google.com/maps"))
      return url.replace("/maps/", "/maps/embed/");
    return url;
  };

  if (loading) return <Loading />;
  if (!business) return <p className="text-white p-6">Business not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 to-red-950 text-white p-6 flex justify-center">
      <main className="flex-grow pt-20 px-4 pb-16 max-w-5xl w-full">
        <h1 className="text-4xl font-extrabold mb-10 text-center bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-lg">
          {business.name}
        </h1>

        <div className="space-y-10 bg-black/70 rounded-2xl p-6 shadow-xl">
          {/* Slideshow */}
          {business.slideshow?.length ? (
            <div>
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={business.slideshow[currentSlide]}
                  alt={`Slide ${currentSlide}`}
                  fill
                  className="object-cover"
                  unoptimized={business.slideshow[currentSlide].startsWith("data:")}
                />
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full"
                >
                  ◀
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 px-3 py-2 rounded-full"
                >
                  ▶
                </button>
              </div>
              <div className="flex justify-center mt-4 gap-2">
                {business.slideshow.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full ${i === currentSlide ? "bg-red-500" : "bg-gray-500"
                      }`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Business Info */}
          <div>
            {business.category && (
              <p className="flex items-center text-red-400 mb-2 text-lg">
                <FaTag className="mr-2" /> {business.category}
              </p>
            )}
            <p className="text-gray-200 mb-4 leading-relaxed border-b border-red-800 pb-6">
              {business.description}
            </p>

            <div className="space-y-2">
              {business.address && (
                <p className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-red-400" /> {business.address}
                </p>
              )}
              {business.phone && (
                <p className="flex items-center">
                  <FaPhoneAlt className="mr-2 text-green-400" /> {business.phone}
                </p>
              )}
            </div>

            {/* Socials */}
            <div className="flex gap-4 mt-4 text-2xl">
              {business.facebook && (
                <a href={business.facebook} target="_blank" rel="noreferrer" className="hover:text-blue-500">
                  <FaFacebookF />
                </a>
              )}
              {business.instagram && (
                <a href={business.instagram} target="_blank" rel="noreferrer" className="hover:text-pink-500">
                  <FaInstagram />
                </a>
              )}
              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-green-500"
                >
                  <FaWhatsapp />
                </a>
              )}
            </div>
          </div>

          {/* Voucher Section */}
          <div className="bg-red-950/40 p-6 rounded-2xl shadow-inner border border-red-800">
            <h2 className="text-2xl font-bold mb-4 text-center text-red-500">
              🎟️ Available Vouchers
            </h2>

            {vouchers.length === 0 ? (
              <p className="text-gray-400 italic">No active vouchers available.</p>
            ) : (
              <>

                <div className="grid md:grid-cols-2 gap-4">
                  {vouchers.slice(0, visibleCount).map((v, idx) => {
                    const expSoon = isExpiringSoon(v.expiryDate)
                    return (
                      <motion.div
                        key={v._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg hover:scale-[1.03] transition-transform duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-yellow-700/10 to-transparent opacity-0 hover:opacity-100 transition duration-500 rounded-xl pointer-events-none" />

                        <h3 className="text-lg font-semibold text-white">{v.title}</h3>
                        <p className="text-sm text-gray-300 mb-1">{v.description}</p>
                        <p className="text-sm text-gray-500 mb-2">
                          ⭐ {v.pointsRequired} pts — Exp:{" "}
                          {v.expiryDate
                            ? new Date(v.expiryDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">Stock: {v.stock}</p>
                        <button
                          onClick={() => handleRedeem(v._id, v.pointsRequired)}
                          className={`mt-2 w-full font-semibold py-2 rounded-lg transition ${canRedeem()
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gray-600 text-gray-300 cursor-not-allowed"
                            }`}
                          disabled={!canRedeem()}
                        >
                          {canRedeem() ? 'Redeem' : 'Cooldown: 1 Day'}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Show More / Show Less Button + counter info */}
                {vouchers.length > 2 && (
                  <div className="text-center mt-6 space-y-2">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="text-sm text-gray-500"
                    >
                      Showing {Math.min(visibleCount, vouchers.length)} of{" "}
                      {vouchers.length} vouchers
                    </motion.p>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setVisibleCount(visibleCount === 2 ? vouchers.length : 2)
                      }
                      className="px-5 py-2 rounded-lg bg-white text-black font-semibold transition text-center transform active:scale-95 hover:bg-red-600 hover:text-white"
                    >
                      {visibleCount === 2 ? "Show More ▼" : "Show Less ▲"}
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map */}
          {business.maps && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-xl border border-stone-700">
                <iframe
                  src={getEmbedUrl(business.maps)}
                  width="100%"
                  height="100%"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
