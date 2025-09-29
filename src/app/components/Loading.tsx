"use client";
import Image from "next/image";

export default function GlobalLoading() {
  return (
    <section className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Pakai gambar roda */}
      <div className="w-24 h-24 animate-spin">
        <Image
          src="/loadingtire3.png" // ganti dengan gambar roda kamu
          alt="Loading..."
          width={96}
          height={96}
          className="object-contain"
        />
      </div>

      {/* Loading Text */}
      <p className="text-white text-lg font-semibold animate-pulse">
        Loading data, please wait...
      </p>
    </section>
  );
}
