"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const events = [
  {
    title: "EXTREME ADVENTURE HARI JADI PONDOK PESANTREN WALI SONGO GOMANG KE 48",
    location: "Tuban, Jawa Timur",
    date: "20-21 September 2025",
    poster: "/poster4.jpg",
  },
  {
    title: "JEJAC MERAH PUTIH ADVENTURE CHALLENGE 2",
    location: "Negare, Bali",
    date: "2-3 Agustus 2025",
    poster: "/poster5.jpg",
  },
  {
    title: "JOP Adventure Challenge Xtreme 1",
    location: "Pasuruan, Jawa Timur",
    date: "26-27 April 2025",
    poster: "/poster6.jpg",
  },
]

export default function UpcomingEvents() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (lightboxOpen) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [lightboxOpen])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="min-h-screen text-white py-16 px-6 flex flex-col items-center bg-gradient-to-b from-black to-stone-950">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
        UPCOMING EVENTS
      </h1> 

      <div className="relative max-w-5xl w-full overflow-hidden rounded-2xl shadow-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {events.map((event, idx) => (
            <div
              key={idx}
              className="w-full flex-shrink-0 grid md:grid-cols-2 gap-8 p-8 bg-cover bg-center relative"
              style={{
                backgroundImage: `url('/loginbg.png')`,
              }}
            >
              <div className="absolute inset-0 bg-black/60"></div>

              <div className="relative z-10 flex flex-col justify-center space-y-4">
                <h2 className="text-2xl font-bold text-red-500">{event.title}</h2>
                <div className="flex items-center space-x-2 text-gray-200">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-200">
                  <span>📅</span>
                  <span>{event.date}</span>
                </div>
              </div>

              <div
                className="relative z-10 flex justify-center items-center cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                <Image
                  src={event.poster}
                  alt={event.title}
                  width={320}
                  height={320}
                  className="rounded-xl w-80 h-80 object-cover border-4 border-stone-700 shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center mt-6 space-x-6">
        <button
          onClick={prevSlide}
          className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-full shadow-lg"
        >
          ◀
        </button>

        <div className="flex space-x-2">
          {events.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3 h-3 rounded-full transition ${
                currentIndex === idx ? "bg-red-600" : "bg-gray-500"
              }`}
            ></button>
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-full shadow-lg"
        >
          ▶
        </button>
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative">
            <Image
              src={events[currentIndex].poster}
              alt="Full Poster"
              width={800}
              height={800}
              className="max-h-[80vh] w-auto rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
