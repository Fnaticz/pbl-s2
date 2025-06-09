"use client";
import { useState } from "react"
import Link from 'next/link'

const businessData = [
  {
    title: "Spartan Modified",
    description: "Jasa modifikasi mobil offroad dan penyedia aksesoris custom Spartan.",
    image: "/bisnisspartan1.jpg",
    link: "/profilebusiness/spartan-modified",
  },
  {
    title: "GP Variasi",
    description: "Jasa modifikasi, reparasi, service, dan pemasangan aksesoris mobil.",
    image: "/bisnisgp3.jpg",
  },
  {
    title: "Spartan Cafe",
    description: "Tempat nongkrong komunitas offroad dengan suasana klasik dan menu lokal.",
    image: "/spartan-cafe.jpg",
  },
  {
    title: "Spartan Apparel",
    description: "Penjualan kaos, jaket, dan aksesoris komunitas Spartan Offroad.",
    image: "/spartan-apparel.jpg",
  },
  {
    title: "Offroad Gear",
    description: "Toko alat dan perlengkapan offroad lengkap untuk petualang sejati.",
    image: "/gear.jpg",
  },
];

const itemPerPage = 2;
const totalPages = Math.ceil(businessData.length / itemPerPage);

export default function BusinessPage() {
  const [currentPage, setCurrentPage] = useState(0);

  const start = currentPage * itemPerPage;
  const visibleBusinesses = businessData.slice(start, start + itemPerPage);

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-stone-900 text-white">
      <section
        id="business"
        className="relative h-screen bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/jimnybg1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70 mix-blend-multiply pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
          <div className="p-10 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] max-w-3xl">
            <h1 className="text-5xl font-bold text-red-600 mb-4">MEMBER BUSINESS</h1>
            <p className="text-lg">
              Beberapa bisnis dari anggota <br />
              <strong>SPARTAN COMMUNITY</strong> akan ditampilkan dalam halaman ini.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-900 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Business</h2>
        <div className="flex flex-col gap-10 items-center">
          {visibleBusinesses.map((business, index) => (
            <div
              key={index}
              className="bg-stone-700 p-6 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] flex gap-6 items-center max-w-7xl w-full"
            >
              <img
                src={business.image}
                alt={business.title}
                className="w-60 h-60 object-cover rounded shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ]"
              />
              <div className="flex flex-col justify-between h-auto md:h-60 max-w-full md:max-w-[calc(100%-16rem)]">
                <p className="text-white text-2xl font-semibold break-words">{business.title}</p>
                <p className="text-white text-lg font-regular break-words">{business.description}</p>
                <Link href={business.link ?? "#"} className="bg-white text-black px-4 py-2 rounded-md self-start mt-4">
                  More
                </Link>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              className={`px-3 py-1 text-white border rounded ${
                currentPage === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:text-black"
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
                    : "bg-gray-700 text-white hover:bg-gray-500"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              className={`px-3 py-1 text-white border rounded ${
                currentPage === totalPages - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:text-black"
              }`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Next &gt;
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
