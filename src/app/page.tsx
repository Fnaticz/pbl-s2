'use client'

import { useEffect, useState } from 'react'
import Slideshow from './components/SlideShow'

type Activity = {
  _id: string;
  title: string;
  desc: string;
  name: string;
  imageUrl: string;
  date: string;
};

const itemPerPage = 2;

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activity');
        const data = await res.json();
        setActivities(data);
      } catch (error) {
        console.error('Failed to load activities:', error);
      }
    };
    fetchActivities();
  }, []);

  const totalPages = Math.ceil(activities.length / itemPerPage);
  const start = currentPage * itemPerPage;
  const visibleActivities = activities.slice(start, start + itemPerPage);

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-stone-900 text-white">
      <section
        id="home"
        className="relative h-screen bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/spartanbg1.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/70 mix-blend-multiply pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
          <div className="p-10 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] max-w-3xl">
            <h1 className="text-5xl font-bold text-red-600 mb-4">SPARTAN COMMUNITY</h1>
            <p className="text-lg">
              Diambil dari nama prajurit yang tak kenal lelah dan tak takut ajal, <br />
              <strong>SPARTAN</strong> adalah komunitas offroad Banyuwangi yang berisi para prajurit dengan kuda besinya.
            </p>
          </div>
        </div>
      </section>

      <Slideshow />

      <section className="py-20 bg-stone-900 px-6">
        <h2 className="text-3xl font-bold text-center mb-8">ACTIVITIES</h2>
        <div className="flex flex-col gap-10 items-center">
          {visibleActivities.length === 0 ? (
            <p className="text-center text-gray-400">Loading or no activities yet.</p>
          ) : (
            visibleActivities.map((activity) => (
              <div
                key={activity._id}
                className="bg-stone-700 p-6 rounded-xl shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ] flex flex-col md:flex-row gap-4 md:gap-6 items-center max-w-7xl w-full"
              >
                <img
                  src={activity.imageUrl}
                  alt={activity.title}
                  className="w-full md:w-60 h-60 object-cover rounded shadow-[ -17px_17px_10px_rgba(0,0,0,0.5) ]"
                />
                <div className="flex flex-col justify-between h-auto md:h-60 max-w-full md:max-w-[calc(100%-16rem)]">
                  <p className="text-white text-2xl font-semibold break-words">{activity.title}</p>
                  <p className="text-white text-lg font-regular break-words mt-3">{activity.desc}</p>
                  <button className="bg-white text-black px-8 py-2 rounded-lg self-start mt-4 font-bold transition transform active:scale-95 active:bg-red-600 active:text-white hover:bg-red-600 hover:text-white">
                    More
                  </button>
                </div>
              </div>
            ))
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-8 px-4">
            <button
              className={`px-3 py-1 text-white border rounded ${
                currentPage === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "transition transform active:scale-95 hover:bg-white hover:text-black"
              }`}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              &lt; Prev
            </button>

            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`px-3 py-1 rounded ${
                  currentPage === index
                    ? "bg-white text-black font-bold"
                    : "bg-gray-700 text-white transition transform hover:bg-gray-500"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              className={`px-3 py-1 text-white border rounded ${
                currentPage === totalPages - 1 || totalPages === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "transition transform active:scale-95 hover:bg-white hover:text-black"
              }`}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || totalPages === 0}>
              Next &gt;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
