"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MainEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  desc: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export default function MainEventSection() {
 const [mainEvent, setMainEvent] = useState<MainEvent[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
    const fetchMainEvent = async () => {
      try {
        const res = await fetch("/api/mainevent");
        if (res.ok) {
          const data = (await res.json()) as MainEvent[];
          setMainEvent(data);
        }

      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchMainEvent();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen text-white flex items-center justify-center">
        <p>Loading main event...</p>
      </section>
    );
  }

  if (mainEvent.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        No events uploaded yet.
      </div>
    );
  }


  return (
    <section className="min-h-screen text-white py-16 px-6 flex flex-col items-center bg-gradient-to-b from-stone-950 via-red-950 to-stone-950">
      <h2 className="text-3xl font-bold text-center mb-12">SPARTAN EVENT</h2>
      <div className="flex flex-col gap-10 items-center w-full max-w-5xl">
        {mainEvent.map((event, idx) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="bg-stone-900/90 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden"
          >
            {/* LEFT: Poster */}
            <div className="relative w-full md:w-1/3 flex items-center justify-center p-4">
              <div className="relative aspect-square w-64">
                <Image
                  src={event.imageUrl}
                  alt={`Banner ${event.title}`}
                  fill
                  className="object-cover rounded-xl shadow-lg"
                />
              </div>
            </div>

            {/* RIGHT: Info */}
            <div className="flex-1 p-6 flex flex-col justify-between relative">
              <div>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-300 mb-1">📅 {event.date}</p>
                <p className="text-sm text-gray-300 mb-3">📍 {event.location}</p>
                <p className="text-sm leading-relaxed">{event.desc}</p>
              </div>
              <Link
                href={`/eventregistform?eventId=${event._id}`}
                className="mt-4 px-4 py-2 rounded-lg bg-white text-black font-semibold transition transform active:scale-95 active:bg-red-600 active:text-white hover:bg-red-600 hover:text-white text-center"
              >
                Join Now
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
