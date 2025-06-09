export default function Footer() {
  return (
    <footer className="bg-red-950 text-white py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center flex-wrap gap-6">
        <div>
          <button className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition">
            Join Us
          </button>
        </div>

        <div>
          <button className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition">
            More
          </button>
        </div>

        <div className="flex gap-4 text-xl">
          <i className="fab fa-facebook hover:text-blue-500 cursor-pointer"></i>
          <i className="fab fa-instagram hover:text-pink-500 cursor-pointer"></i>
          <i className="fab fa-twitter hover:text-sky-400 cursor-pointer"></i>
          <i className="fab fa-youtube hover:text-red-500 cursor-pointer"></i>
        </div>
      </div>

      <p className="text-center mt-6 text-sm opacity-60">© 2025 Spartan</p>
    </footer>
  );
}
