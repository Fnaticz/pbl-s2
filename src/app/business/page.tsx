"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Loading from '../components/Loading';

type RawBusiness = {
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  desc?: string;
  image?: string;
  slideshow?: string[];
  link?: string;
  username?: string;
};

type Business = {
  _id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
};

const itemPerPage = 2;

export default function BusinessPage() {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch("/api/business/public");
        const data: RawBusiness[] = await res.json();
        if (!Array.isArray(data)) {
          setBusinesses([]);
          setFilteredBusinesses([]);
          return;
        }

        const mapped: Business[] = data.map((b) => {
          const img =
            (Array.isArray(b.slideshow) && b.slideshow.length > 0 && b.slideshow[0]) ||
            b.image ||
            "/placeholder.jpg";

          return {
            _id: b._id ?? String(Date.now()),
            title: b.name || b.title || "Untitled Business",
            description: b.description || b.desc || "",
            image: img,
            link: b._id ? `/business/${b._id}` : undefined,
          };
        });

        setBusinesses(mapped);
        setFilteredBusinesses(mapped);
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
        setBusinesses([]);
        setFilteredBusinesses([]);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredBusinesses(businesses);
      setCurrentPage(0);
      return;
    }
    const filtered = businesses.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
    setFilteredBusinesses(filtered);
    setCurrentPage(0);
  }, [searchQuery, businesses]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBusinesses.length / itemPerPage)
  );
  const start = currentPage * itemPerPage;
  const visibleBusinesses = filteredBusinesses.slice(
    start,
    start + itemPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderThumbnail = (src: string, alt: string) => {
    return (
      <div className="relative w-full md:w-1/3 flex items-center justify-center p-4">
        <div className="relative aspect-square w-64">
          <Image
            src={src || "/placeholder.jpg"}
            alt={alt}
            fill
            className="object-cover rounded-xl shadow-lg"
            unoptimized={src.startsWith("data:")}
          />
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-stone-900 text-white min-h-screen">
      <section
      id="business"
      className="relative h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/jimnybg1.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 bg-black/20 to-black pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
        <motion.div
          className="p-10 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-5xl font-bold text-red-600 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            MEMBER BUSINESS
          </motion.h1>

          <motion.p
            className="text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Beberapa bisnis dari anggota <br />
            <strong>SPARTAN COMMUNITY</strong> akan ditampilkan dalam halaman ini.
          </motion.p>
        </motion.div>
      </div>
    </section>

      <section className="min-h-screen text-white py-16 px-6 flex flex-col items-center bg-gradient-to-b from-black to-red-950">
        <h2 className="text-3xl font-bold text-center mb-8">BUSINESSES</h2>

        <div className="w-full max-w-3xl mb-10">
          <input
            type="text"
            placeholder="🔍 Search Member Business"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/50 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div className="flex flex-col gap-10 items-center w-full max-w-5xl">
          {visibleBusinesses.length > 0 ? (
            visibleBusinesses.map((business, idx) => (
              <motion.div
                key={business._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="bg-stone-900/90 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden w-full"
              >
                {renderThumbnail(business.image, business.title)}

                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3">
                      {business.title}
                    </h3>
                    <p className="text-sm leading-relaxed">
                      {business.description}
                    </p>
                  </div>
                  {business.link && (
                    <Link
                      href={business.link}
                      className="mt-4 px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition text-center transition transform active:scale-95 active:bg-red-600 active:text-white hover:bg-red-600 hover:text-white"
                    >
                      More
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-400">No Business Found.</p>
          )}

          {totalPages > 0 && (
            <div className="flex items-center gap-2 mt-10">
              <button
                className={`px-3 py-1 text-white border rounded ${currentPage === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "transition transform active:scale-95 active:bg-white active:text-black hover:bg-white hover:text-black"
                  }`}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                &lt; Prev
              </button>

              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`px-3 py-1 rounded ${currentPage === index
                    ? "bg-white text-black font-bold"
                    : "bg-gray-700 text-white transition transform active:scale-95 active:bg-gray-500 hover:bg-gray-500"
                    }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className={`px-3 py-1 text-white border rounded ${currentPage === totalPages - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "transition transform active:scale-95 active:bg-white active:text-black hover:bg-white hover:text-black"
                  }`}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Next &gt;
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
