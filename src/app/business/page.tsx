"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

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
    const commonClass =
      "w-full md:w-60 h-60 object-cover rounded shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ]";

    if (!src) {
      return (
        <Image
          src="/placeholder.jpg"
          alt={alt}
          width={240}
          height={240}
          className={commonClass}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={240}
        height={240}
        className={commonClass}
        unoptimized={src.startsWith("data:")}
      />
    );
  };

  return (
    <div className="bg-stone-900 text-white min-h-screen">
      <section
        id="business"
        className="relative h-screen bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/jimnybg1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70 mix-blend-multiply pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
          <div className="p-10 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] max-w-3xl">
            <h1 className="text-5xl font-bold text-red-600 mb-4">
              MEMBER BUSINESS
            </h1>
            <p className="text-lg">
              Beberapa bisnis dari anggota <br />
              <strong>SPARTAN COMMUNITY</strong> akan ditampilkan dalam halaman
              ini.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-900 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">BUSINESSES</h2>

        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="🔍 Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-3 rounded-lg w-full md:w-1/2 
                      text-black focus:outline-none
                      border border-gray-300 shadow-lg
                      focus:ring-2 focus:ring-red-500
                      transition duration-200"
          />
        </div>

        <div className="flex flex-col gap-10 items-center">
          {visibleBusinesses.length > 0 ? (
            visibleBusinesses.map((business) => (
              <div
                key={business._id}
                className="bg-stone-700 p-6 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] flex flex-col md:flex-row gap-4 md:gap-6 items-center max-w-7xl w-full"
              >
                {renderThumbnail(business.image, business.title)}

                <div className="flex flex-col justify-between h-auto md:h-60 max-w-full md:max-w-[calc(100%-16rem)]">
                  <p className="text-white text-2xl font-semibold break-words">
                    {business.title}
                  </p>
                  <p className="text-white text-lg mt-3 break-words">
                    {business.description}
                  </p>
                  {business.link && (
                    <Link
                      href={business.link}
                      className="bg-white text-black px-8 py-2 rounded-lg self-start mt-4 font-bold transition transform active:scale-95 active:bg-red-600 active:text-white hover:bg-red-600 hover:text-white"
                    >
                      More
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No businesses found.</p>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                className={`px-3 py-1 text-white border rounded ${
                  currentPage === 0
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
                  className={`px-3 py-1 rounded ${
                    currentPage === index
                      ? "bg-white text-black font-bold"
                      : "bg-gray-700 text-white transition transform active:scale-95 active:bg-gray-500 hover:bg-gray-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className={`px-3 py-1 text-white border rounded ${
                  currentPage === totalPages - 1
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
