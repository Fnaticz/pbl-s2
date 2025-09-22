"use client";

import { useState, useEffect } from "react";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

interface Business {
  _id: string;
  username: string;
  name: string;
  category?: string;
  description?: string;
  address?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  maps?: string;
  slideshow: string[];
}

export default function CompanyProfile() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch("/api/business");
        if (res.ok) {
          const data: Business[] = await res.json();
          if (data.length > 0) setBusiness(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch business:", err);
      }
    };

    fetchBusiness();
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) =>
      business ? (prev + 1) % business.slideshow.length : 0
    );
  const prevSlide = () =>
    setCurrentSlide((prev) =>
      business ? (prev - 1 + business.slideshow.length) % business.slideshow.length : 0
    );

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading business profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
      <main className="flex-grow pt-20 px-4 pb-16">
        <h1 className="text-center text-4xl font-extrabold mb-6">
          {business.name}
        </h1>

        {/* Slideshow */}
        {business.slideshow.length > 0 && (
          <div className="flex items-center justify-center mb-6 relative">
            <Image
              src={business.slideshow[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              width={600}
              height={400}
              unoptimized={business.slideshow[currentSlide].startsWith("data:")}
              className="w-full max-w-md rounded-md shadow-lg"
            />
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-0 transform -translate-y-1/2 text-2xl bg-black bg-opacity-50 px-2 py-1 rounded-full hover:bg-red-600"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 text-2xl bg-black bg-opacity-50 px-2 py-1 rounded-full hover:bg-red-600"
            >
              ›
            </button>

            <div className="absolute bottom-2 flex gap-2">
              {business.slideshow.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer ${
                    currentSlide === idx ? "bg-white" : "bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {business.description && (
          <p className="text-center max-w-2xl mx-auto text-sm md:text-base text-gray-200 mb-10 leading-relaxed">
            {business.description}
          </p>
        )}

        {/* Contact Button */}
        {business.whatsapp && (
          <div className="text-center mb-8">
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full">
                Contact Us
              </button>
            </a>
          </div>
        )}

        {/* Social Media */}
        <div className="flex justify-center gap-4 text-xl mb-10">
          {business.facebook && (
            <a
              href={business.facebook}
              target="_blank"
              className="hover:text-blue-500"
            >
              <FaFacebookF />
            </a>
          )}
          {business.instagram && (
            <a
              href={business.instagram}
              target="_blank"
              className="hover:text-pink-500"
            >
              <FaInstagram />
            </a>
          )}
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              className="hover:text-green-500"
            >
              <FaWhatsapp />
            </a>
          )}
        </div>

        {/* Maps */}
        {business.maps && (
          <div className="flex justify-center">
            <iframe
              title="Company Location"
              src={business.maps}
              width="100%"
              height="300"
              className="rounded-md shadow-lg max-w-md w-full"
              loading="lazy"
            />
          </div>
        )}
      </main>
    </div>
  );
}
