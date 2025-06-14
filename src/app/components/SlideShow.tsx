'use client'

import { useEffect, useState } from 'react'

const eventImages = [
  '/poster1.jpg',
  '/poster2.jpg',
  '/poster3.jpg',
]

export default function SlideShow() {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === eventImages.length - 1 ? 0 : prev + 1))
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? eventImages.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev === eventImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <section id="upcoming" className="bg-gradient-to-b from-black via-red-950 to-black py-20 text-white">
      <h2 className="text-3xl font-bold text-center mb-10">UPCOMING EVENTS</h2>

      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-2xl px-4">
          <div onClick={() => setLightbox(true)} className="flex items-center justify-center bg-black/40 p-4 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] transition-all duration-500">
            <img
              src={eventImages[current]}
              alt={`Event ${current + 1}`}
              className="rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] w-full h-[800px] object-cover transition-opacity duration-500"
            />
          </div>

          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-1 transform -translate-y-1/2 text-3xl bg-black bg-opacity-50 px-2 py-0.5 rounded-full transition transform active:scale-70 active:bg-red-600 hover:bg-red-600"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-1 transform -translate-y-1/2 text-3xl bg-black bg-opacity-50 px-2 py-0.5 rounded-full transition transform active:scale-70 active:bg-red-600 hover:bg-red-600 transition"
          >
            ›
          </button>

          <div className="flex justify-center mt-4 gap-2">
            {eventImages.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition ${current === index ? 'bg-red-600 scale-110' : 'bg-gray-400'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <div
            className="relative max-w-4xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={eventImages[current]}
              alt="Full preview"
              className="w-full max-h-[90vh] object-contain rounded-xl shadow-xl"
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 text-white text-xl bg-black/50 px-3 py-1 rounded-full hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
