"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // ✅ ambil user dari NextAuth
import { FaPlus, FaImage, FaVideo } from "react-icons/fa";
import Image from "next/image";

interface MediaItem {
  _id: string;
  type: "image" | "video";
  url: string;
  username: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 6;

export default function GalleryPage() {
  const { data: session } = useSession(); // ✅ akses user session
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Fetch semua media dari DB
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch("/api/media");
        if (res.ok) {
          const data = await res.json();
          setMedia(data);
        }
      } catch (err) {
        console.error("Failed to fetch media:", err);
      }
    };
    fetchMedia();
  }, []);

  // Upload file ke DB
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;

      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: fileType,
          url: base64,
          username: session?.user?.username || session?.user?.emailOrPhone || "guest",
        }),
      });

      if (response.ok) {
        const newMedia = await response.json();
        setMedia((prev) => [newMedia, ...prev]);
      } else {
        console.error("Upload failed");
      }
    };

    reader.readAsDataURL(file);
  };

  const totalPages = Math.ceil(media.length / ITEMS_PER_PAGE);
  const displayedMedia = media.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950 to-black text-white px-6 pt-32 pb-10">
      <h1 className="text-3xl font-bold text-center mb-8">GALLERY</h1>

      {/* Upload */}
      <div className="flex gap-4 justify-center mb-8">
        <label className="bg-white text-black px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2 shadow">
          <FaPlus />
          <span>Add File</span>
          <input
            type="file"
            accept={fileType === "image" ? "image/*" : "video/*"}
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        <button
          onClick={() => setFileType("image")}
          className={`border px-4 py-3 rounded-lg ${
            fileType === "image"
              ? "border-blue-400"
              : "border-transparent"
          }`}
        >
          <FaImage />
        </button>

        <button
          onClick={() => setFileType("video")}
          className={`border px-4 py-3 rounded-lg ${
            fileType === "video"
              ? "border-blue-400"
              : "border-transparent"
          }`}
        >
          <FaVideo />
        </button>
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/10 p-4 rounded-xl mb-6">
        {displayedMedia.length === 0 && (
          <p className="text-center col-span-full text-sm text-gray-400">
            No media uploaded.
          </p>
        )}
        {displayedMedia.map((item) => (
          <div
            key={item._id}
            className="bg-white/20 p-2 rounded-md text-center cursor-pointer"
            onClick={() => setSelectedMedia(item)}
          >
            {item.type === "image" ? (
              <Image
                src={item.url}
                alt="Uploaded"
                width={300}
                height={200}
                className="w-full h-48 object-cover rounded"
                unoptimized={item.url.startsWith("data:")}
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-48 rounded object-cover"
                muted
              />
            )}
            <p className="text-sm mt-2 text-gray-200 italic">
              Uploaded by: {item.username}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 text-sm">
          <button
            className="text-gray-400 hover:text-white"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            &lt; Prev
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setPage(index + 1)}
              className={`w-8 h-8 rounded ${
                page === index + 1
                  ? "bg-white text-black font-bold"
                  : "bg-gray-700 text-white"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="text-gray-400 hover:text-white"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next &gt;
          </button>
        </div>
      )}

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-w-3xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "image" ? (
              <Image
                src={selectedMedia.url}
                alt="Full"
                width={800}
                height={600}
                className="w-full max-h-[80vh] object-contain rounded"
                unoptimized={selectedMedia.url.startsWith("data:")}
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain rounded"
              />
            )}
            <p className="text-center text-sm mt-2 text-gray-300 italic">
              Uploaded by: {selectedMedia.username}
            </p>
            <button
              className="block mx-auto mt-4 px-6 py-2 bg-white text-black rounded hover:bg-gray-200"
              onClick={() => setSelectedMedia(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
