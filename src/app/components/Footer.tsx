import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from "react-icons/fa"
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-red-950 text-white py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 text-center gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Join Us</h3>
          <Link href="/joinmember" className="bg-white text-black px-4 py-2 rounded-md font-semibold">
            Join Us
          </Link>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Business</h3>
          <Link href="/business" className="bg-white text-black px-4 py-2 rounded-md font-semibold">
            More
          </Link>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Social</h3>
          <div className="flex justify-center gap-4 text-xl">
            <a href="https://facebook.com" target="_blank" className="hover:text-blue-500"><FaFacebookF /></a>
            <a href="https://instagram.com" target="_blank" className="hover:text-pink-500"><FaInstagram /></a>
            <a href="https://wa.me/6281234567890" target="_blank" className="hover:text-green-500"><FaWhatsapp /></a>
            <a href="https://youtube.com" target="_blank" className="hover:text-red-500"><FaYoutube /></a>
            <a href="https://tiktok.com" target="_blank" className="hover:text-stone-900"><FaTiktok /></a>
          </div>
        </div>
      </div>

      <p className="text-center mt-6 text-sm opacity-60">© 2025 Spartan</p>
    </footer>
  );
}
