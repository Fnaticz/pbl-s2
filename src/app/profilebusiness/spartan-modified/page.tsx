"use client"
import { useState } from "react"
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa"

const images = ["/bisnisspartan2.jpg", "/bisnisspartan3.jpg", "/img3.jpg"]

export default function CompanyProfile() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-4 py-10">
      <main className="flex-grow pt-20 px-4 pb-16">
        <h1 className="text-center text-4xl font-extrabold mb-6">SPARTAN MODIFIED</h1>
        <div className="flex justify-center mb-6">
          <img src="/bisnisspartan1.jpg" alt="Company" className="w-full max-w-md rounded-md shadow-lg" />
        </div>
        <p className="text-center max-w-2xl mx-auto text-sm md:text-base text-gray-200 mb-10 leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
          industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
        </p>

        <div className="relative flex flex-col items-center mb-8">
          <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="w-full max-w-md rounded-md" />

          <button onClick={prevSlide} className="absolute left-120 top-1/2 -translate-y-1/2 text-2xl">{'‹'}</button>
          <button onClick={nextSlide} className="absolute right-120 top-1/2 -translate-y-1/2 text-2xl">{'›'}</button>

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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253840.59333280826!2d106.66470250841296!3d-6.229728023032204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1572d14c3b7%3A0x301576d14feb9d0!2sJakarta!5e0!3m2!1sen!2sid!4v1620810675653!5m2!1sen!2sid"
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
