"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Banner {
  _id: string;
  name: string;
  title: string;
  location: string;
  eventDate: string;
  imageUrl: string;
  uploadedAt: string;
}

export default function UpcomingEvents() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banner");
        if (res.ok) {
          const data = (await res.json()) as Banner[];
          setBanners(data);
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
      }
    };
    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  useEffect(() => {
    if (lightboxOpen || banners.length === 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [lightboxOpen, banners.length, nextSlide]);

  if (banners.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        No events uploaded yet.
      </div>
    );
  }

  return (
    <section id="activities"  className="min-h-screen text-white py-16 px-6 flex flex-col items-center bg-gradient-to-b from-black to-stone-950">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
        UPCOMING EVENTS
      </h1>

      <div className="relative max-w-5xl w-full overflow-hidden rounded-2xl shadow-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((event) => (
            <div
              key={event._id}
              className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8 bg-cover bg-center relative"
              style={{ backgroundImage: `url('/loginbg.png')` }}
            >
              <div className="absolute inset-0 bg-black/60"></div>

              <div className="relative z-10 flex flex-col justify-center space-y-3 md:space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-red-500 break-words">{event.title}</h2>
                <div className="flex items-center space-x-2 text-sm md:text-base text-gray-200">
                  <span>📍</span>
                  <span className="break-words">{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm md:text-base text-gray-200">
                  <span>📅</span>
                  <span>{event.eventDate}</span>
                </div>
              </div>

              <div
                className="relative z-10 flex justify-center items-center cursor-pointer mt-4 md:mt-0"
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={320}
                  height={320}
                  unoptimized={event.imageUrl.startsWith("data:")}
                  className="rounded-xl w-64 h-64 md:w-80 md:h-80 object-cover border-4 border-stone-700 shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center mt-4 md:mt-6 space-x-4 md:space-x-6">
        <button
          onClick={prevSlide}
          className="bg-stone-700 hover:bg-stone-600 px-3 md:px-4 py-2 rounded-full shadow-lg text-sm md:text-base"
          aria-label="Previous slide"
        >
          ◀
        </button>
        <div className="flex space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition ${
                currentIndex === idx ? "bg-red-600" : "bg-gray-500"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="bg-stone-700 hover:bg-stone-600 px-3 md:px-4 py-2 rounded-full shadow-lg text-sm md:text-base"
          aria-label="Next slide"
        >
          ▶
        </button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={banners[currentIndex].imageUrl}
              alt="Full Poster"
              width={800}
              height={800}
              unoptimized={banners[currentIndex].imageUrl.startsWith("data:")}
              className="max-h-[90vh] w-auto rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-lg md:text-xl"
              aria-label="Close lightbox"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
