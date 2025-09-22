"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

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

export default function BusinessDetailPage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/business/${username}`);
        if (res.ok) {
          const data: Business = await res.json();
          setBusiness(data);
        }
      } catch (err) {
        console.error("Failed to fetch business detail:", err);
      }
    };

    fetchDetail();
  }, [username]);

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading business detail...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
      <main className="max-w-5xl mx-auto pt-20 pb-16">
        <h1 className="text-4xl font-bold text-center mb-6">{business.name}</h1>

        {/* Slideshow */}
        {business.slideshow?.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {business.slideshow.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                alt={`Slideshow ${idx}`}
                width={400}
                height={300}
                unoptimized={img.startsWith("data:")}
                className="rounded-md shadow-lg"
              />
            ))}
          </div>
        )}

        <p className="text-center max-w-2xl mx-auto text-sm md:text-base text-gray-200 mb-10 leading-relaxed">
          {business.description}
        </p>

        <div className="text-center mb-8">
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full">
                Contact Us
              </button>
            </a>
          )}
        </div>

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
              title="Business Location"
              src={business.maps}
              width="100%"
              height="300"
              className="rounded-md shadow-lg max-w-2xl w-full"
              loading="lazy"
            />
          </div>
        )}
      </main>
    </div>
  );
}
