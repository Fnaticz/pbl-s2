"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  _id: string;
  title: string;
  desc: string;
  name: string;
  images: string[];
  createdAt: string;
}

function ActivityCard({ id, title, description, images, expanded, onToggle }: {
  id: string;
  title: string;
  description: string;
  images: string[];
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="bg-stone-900/90 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden transition-all duration-500"
    >
      <div
        className={`relative w-full md:w-1/3 flex items-center justify-center p-4 ${
          expanded ? "flex-col" : "cursor-pointer"
        }`}
        onClick={!expanded ? handleImageClick : undefined}
      >
        {!expanded ? (
          <div className="relative w-64 h-64">
            {images.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <motion.div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{
                    zIndex: isActive ? 20 : 10 - idx,
                    opacity: isActive ? 1 : 0.7,
                    rotate: (idx - currentIndex) * 5,
                    x: (idx - currentIndex) * 15,
                    y: (idx - currentIndex) * 5,
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={img}
                    alt={`Activity image ${idx}`}
                    fill
                    className="object-cover rounded-xl shadow-lg"
                    unoptimized={img.startsWith("data:") || img.startsWith("blob:")}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {images.map((img, idx) => (
              <motion.div
                key={idx}
                className="aspect-square relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Image
                  src={img}
                  alt={`Activity expanded ${idx}`}
                  fill
                  className="object-cover rounded-xl shadow-lg"
                  unoptimized={img.startsWith("data:") || img.startsWith("blob:")}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between relative">
        <div>
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p
            className={`text-sm leading-relaxed ${
              expanded
                ? ""
                : "line-clamp-4 relative after:content-[''] after:block after:h-8 after:w-full after:absolute after:bottom-0 after:bg-gradient-to-t after:from-stone-900/90 after:to-transparent"
            }`}
          >
            {description}
          </p>
        </div>
        <button
          onClick={() => onToggle(id)}
          className="mt-4 px-4 py-2 rounded-lg bg-white text-black font-semibold transition transform active:scale-95 active:bg-red-600 active:text-white hover:bg-red-600 hover:text-white"
        >
          {expanded ? "Collapse" : "More"}
        </button>
      </div>
    </motion.div>
  );
}

export default function ActivitiesSection() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activitiesPerPage = 2;
  const totalPages = Math.ceil(activities.length / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const visibleActivities = activities.slice(startIndex, startIndex + activitiesPerPage);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };
    fetchActivities();
  }, []);

  return (
    <section className="min-h-screen text-white py-16 px-6 flex flex-col items-center bg-gradient-to-b from-stone-950 to-red-950">
      <h2 className="text-3xl font-bold text-center mb-8">ACTIVITIES</h2>

      <AnimatePresence mode="wait">
        <div
          key={currentPage}
          className="flex flex-col gap-10 items-center w-full max-w-5xl"
        >
          {visibleActivities.map((activity) => (
            <ActivityCard
              key={activity._id}
              id={activity._id}
              title={activity.title}
              description={activity.desc}
              images={activity.images}
              expanded={expandedId === activity._id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </AnimatePresence>

      <div className="flex items-center gap-2 mt-10">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-3 py-1 rounded-md border border-gray-500 disabled:opacity-50"
        >
          &lt; Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === idx + 1
                ? "bg-blue-900 text-white"
                : "bg-gray-700 text-white"
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-3 py-1 rounded-md border border-gray-500 disabled:opacity-50"
        >
          Next &gt;
        </button>
      </div>
    </section>
  );
}
