"use client"
import { useState } from "react"
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa"

const images = ["/bisnisgp2.jpg", "/bisnisgp1.jpg", "/img3.jpg"]

export default function CompanyProfile() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
      <main className="flex-grow pt-20 px-4 pb-16">
        <h1 className="text-center text-4xl font-extrabold mb-6">GP VARIASI</h1>
        <div className="flex justify-center mb-6">
          <img src="/bisnisgp3.jpg" alt="Company" className="w-full max-w-md rounded-md shadow-lg" />
        </div>
        <p className="text-center max-w-2xl mx-auto text-sm md:text-base text-gray-200 mb-10 leading-relaxed">
          GP Variasi menyediakan jasa modifikasi berbagai tipe kendaraan, mulai dari tipe sedan, minibus, dan bahkan kendaraan offroad. 
        </p>

        <div className="relative flex flex-col items-center mb-8">
          <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="w-full max-w-md rounded-md" />

          <button onClick={prevSlide} className="absolute left-120 top-1/2 -translate-y-1/2 text-2xl bg-black bg-opacity-50 px-1 py-0.2 rounded-full hover:bg-red-600 transition">{'‹'}</button>
          <button onClick={nextSlide} className="absolute right-120 top-1/2 -translate-y-1/2 text-2xl bg-black bg-opacity-50 px-1 py-0.2 rounded-full hover:bg-red-600 transition">{'›'}</button>

          <div className="mt-3 flex gap-2">
            {images.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full ${currentSlide === idx ? 'bg-white' : 'bg-gray-500'} cursor-pointer`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full">
              Contact Us
            </button>
          </a>
        </div>

        <div className="flex justify-center gap-4 text-xl mb-10">
          <a href="https://facebook.com" target="_blank" className="hover:text-blue-500"><FaFacebookF /></a>
          <a href="https://instagram.com" target="_blank" className="hover:text-pink-500"><FaInstagram /></a>
          <a href="https://wa.me/6281234567890" target="_blank" className="hover:text-green-500"><FaWhatsapp /></a>
        </div>

        <div className="flex justify-center">
          <iframe
            title="Company Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1660.098434029081!2d114.33157621117596!3d-8.262749718108791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd1507fac0a3ba1%3A0xd2fce1f27c5434f4!2sGp%20Variasi%20Ac%20Mobil%20P.Window!5e0!3m2!1sid!2sid!4v1749476175105!5m2!1sid!2sid"
            width="100%"
            height="300"
            className="rounded-md shadow-lg max-w-md w-full"
            loading="lazy"
          />
        </div>
      </main>

    </div>
  )
}
