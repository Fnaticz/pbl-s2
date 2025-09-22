"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function BusinessDetail() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`/api/business/${username}`);
        if (!res.ok) throw new Error("Failed to fetch business");
        const data = await res.json();
        setBusiness(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (username) fetchBusiness();
  }, [username]);

  if (!business) {
    return <p className="text-center text-gray-400">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">{business.name}</h1>
      <p className="mb-2">{business.description}</p>
      <p className="text-sm text-gray-400">📍 {business.address}</p>
      <p className="text-sm text-gray-400">📞 {business.phone}</p>

      {business.slideshow?.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {business.slideshow.map((img: string, idx: number) => (
            <Image
              key={idx}
              src={img}
              alt={`slide ${idx}`}
              width={400}
              height={300}
              className="rounded-lg object-cover"
              unoptimized={img.startsWith("data:")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
