"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaTag,
} from "react-icons/fa";

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

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/business/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
        }
      } catch (err) {
        console.error("Fetch business detail error:", err);
      }
    };
    fetchDetail();
  }, [id]);

  if (!business) return <p className="text-white p-6">Loading...</p>;

  // Convert Google Maps link ke embed URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("/maps/embed")) return url; // sudah embed
    if (url.includes("google.com/maps")) {
      return url.replace("/maps/", "/maps/embed/");
    }
    if (url.includes("goo.gl/maps")) {
      // untuk shortlink biarkan dipakai langsung, kadang bisa auto-embed
      return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
        url
      )}`;
    }
    return url;
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-stone-950 to-black text-white p-6 flex justify-center">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
          {business.name}
        </h1>

        {/* Info section */}
        <div className="bg-stone-800/80 rounded-2xl shadow-lg p-6 mb-10">
          {business.category && (
            <p className="flex items-center text-red-400 mb-2 text-lg">
              <FaTag className="mr-2" /> {business.category}
            </p>
          )}
          <p className="text-gray-200 mb-4 leading-relaxed">
            {business.description}
          </p>

          {business.address && (
            <p className="flex items-center mb-2">
              <FaMapMarkerAlt className="mr-2 text-red-400" />{" "}
              {business.address}
            </p>
          )}
          {business.phone && (
            <p className="flex items-center mb-2">
              <FaPhoneAlt className="mr-2 text-green-400" /> {business.phone}
            </p>
          )}

          {/* Social links */}
          <div className="flex gap-4 mt-4 text-2xl">
            {business.facebook && (
              <a
                href={business.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition"
              >
                <FaFacebookF />
              </a>
            )}
            {business.instagram && (
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-500 transition"
              >
                <FaInstagram />
              </a>
            )}
            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-500 transition"
              >
                <FaWhatsapp />
              </a>
            )}
          </div>
        </div>

        {/* Slideshow */}
        {business.slideshow && business.slideshow.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
            <div className="relative w-full h-72 sm:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={business.slideshow[currentSlide]}
                alt={`Slide ${currentSlide}`}
                fill
                className="object-cover"
                unoptimized={business.slideshow[currentSlide].startsWith("data:")}
              />

              {/* Controls */}
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

            {/* Dots */}
            <div className="flex justify-center mt-4 gap-2">
              {business.slideshow.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full ${
                    i === currentSlide ? "bg-red-500" : "bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Google Maps */}
        {business.maps && (
          <div className="mt-10">
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
    </div>
  );
}
