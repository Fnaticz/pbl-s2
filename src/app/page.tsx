'use client'

import { useEffect, useState } from 'react'
import Slideshow from './components/SlideShow'
import ActivityCard from "./components/Activities";
import Loading from './components/Loading';

// type Activity = {
//   _id: string;
//   title: string;
//   desc: string;
//   name: string;
//   imageUrl: string;
//   date: string;
// };

// const itemPerPage = 2;

export default function Home() {
  const [loading, setLoading] = useState(true);
  // const [activities, setActivities] = useState<Activity[]>([]);
  // const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulasi fetch
    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   const fetchActivities = async () => {
  //     try {
  //       const res = await fetch('/api/activity');
  //       const data = await res.json();
  //       setActivities(data);
  //     } catch (error) {
  //       console.error('Failed to load activities:', error);
  //     }
  //   };
  //   fetchActivities();
  // }, []);

  // const totalPages = Math.ceil(activities.length / itemPerPage);
  // const start = currentPage * itemPerPage;
  // const visibleActivities = activities.slice(start, start + itemPerPage);

  // const goToPage = (page: number) => {
  //   if (page >= 0 && page < totalPages) {
  //     setCurrentPage(page);
  //   }
  // };
 if (loading) return <Loading />;
 
  return (
    <div className="bg-stone-900 text-white">
      <section
        id="home"
        className="relative h-screen bg-cover bg-center text-white overflow-hidden"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/spartanbgvd.mp4"
          autoPlay
          loop
          muted
          playsInline
        ></video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black pointer-events-none" />
      </section>

      <Slideshow />
      <ActivityCard />
    </div>
  );
}
