"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaTrash, FaPlus, FaImage, FaVideo, FaUser } from "react-icons/fa";
import Image from "next/image";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import Confirm from "../components/Confirm";

interface MediaItem {
  _id: string;
  type: "image" | "video";
  url: string;
  username: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 6;

export default function GalleryPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [fileType, setFileType] = useState<"image" | "video">("image");
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [alert, setAlert] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'warning' | 'info' }>({ isOpen: false, message: '', type: 'info' })
  const [confirm, setConfirm] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({ isOpen: false, message: '', onConfirm: () => {} })

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch("/api/media");
        if (res.ok) {
          const data = await res.json();
          setMedia(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch media:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const fileCount = fileArray.length;

    setConfirm({
      isOpen: true,
      message: `Upload ${fileCount} file${fileCount > 1 ? 's' : ''}?`,
      onConfirm: async () => {
        setUploading(true);
        const formData = new FormData();
        
        // Append semua file
        fileArray.forEach((file) => {
          formData.append("file", file);
        });
        
        formData.append("type", fileType);
        formData.append(
          "username",
          session?.user?.username || session?.user?.emailOrPhone || "guest"
        );

        try {
          const response = await fetch("/api/media/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            // Handle both single object and array response
            const newMediaArray = Array.isArray(result) ? result : [result];
            setMedia((prev) => [...newMediaArray, ...prev]);
            setAlert({ 
              isOpen: true, 
              message: `Successfully uploaded ${newMediaArray.length} file${newMediaArray.length > 1 ? 's' : ''}!`, 
              type: 'success' 
            });
          } else {
            const err = await response.json();
            setAlert({ isOpen: true, message: err.message || "Upload failed", type: 'error' })
          }
        } catch (err) {
          console.error("Upload error:", err);
          setAlert({ isOpen: true, message: "Server error. Please try again.", type: 'error' })
        } finally {
          setUploading(false);
          // Reset input
          e.target.value = "";
          setConfirm({ isOpen: false, message: '', onConfirm: () => {} });
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    setConfirm({
      isOpen: true,
      message: "Are you sure you want to delete this media?",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
          if (res.ok) {
            setMedia((prev) => prev.filter((item) => item._id !== id));
            setAlert({ isOpen: true, message: "Media deleted successfully", type: 'success' })
          } else {
            const err = await res.json();
            setAlert({ isOpen: true, message: err.message || "Delete failed", type: 'error' })
          }
          setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
        } catch (err) {
          console.error("Delete error:", err);
          setAlert({ isOpen: true, message: "Failed to delete media", type: 'error' })
          setConfirm({ isOpen: false, message: '', onConfirm: () => {} })
        }
      }
    })
  };

  const filteredMedia = showOnlyMine
    ? media.filter(
        (item) =>
          item.username === session?.user?.username ||
          item.username === session?.user?.emailOrPhone
      )
    : media;

  const totalPages = Math.max(1, Math.ceil(filteredMedia.length / ITEMS_PER_PAGE));
  const displayedMedia = filteredMedia.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-red-950 text-white px-6 pt-32 pb-10">
      <h1 className="text-3xl font-bold text-center mb-8">GALLERY</h1>

      {/* Controls */}
      <div className="flex gap-4 justify-center mb-8 flex-wrap">
        <label className={`px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2 shadow ${uploading ? 'bg-gray-500 cursor-not-allowed' : 'bg-white text-black'}`}>
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <FaPlus />
              <span>Add File{fileType === "image" ? "s" : ""} (Multiple)</span>
            </>
          )}
          <input
            type="file"
            accept={fileType === "image" ? "image/*" : "video/*"}
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        <button
          onClick={() => setFileType("image")}
          className={`border px-4 py-3 rounded-lg ${fileType === "image" ? "border-blue-400" : "border-transparent"}`}
        >
          <FaImage />
        </button>

        <button
          onClick={() => setFileType("video")}
          className={`border px-4 py-3 rounded-lg ${fileType === "video" ? "border-blue-400" : "border-transparent"}`}
        >
          <FaVideo />
        </button>

        {session && (
          <button
            onClick={() => setShowOnlyMine((prev) => !prev)}
            className={`px-4 py-3 rounded-lg flex items-center gap-2 ${showOnlyMine ? "bg-blue-600" : "bg-gray-700"}`}
          >
            <FaUser />
            {showOnlyMine ? "Show All" : "Uploaded"}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/10 p-4 rounded-xl mb-6">
        {displayedMedia.length === 0 && (
          <p className="text-center col-span-full text-sm text-gray-400">
            No media uploaded.
          </p>
        )}

        {displayedMedia.map((item) => {
          const isOwner =
            session &&
            (item.username === session.user?.username ||
              item.username === session.user?.emailOrPhone);

          return (
            <div key={item._id} className="bg-white/20 p-2 rounded-md text-center">
              {/* clickable wrapper: tap/click untuk open preview */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedMedia(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedMedia(item);
                  }
                }}
                className="cursor-pointer select-none"
                aria-label={`Open ${item.type} uploaded by ${item.username}`}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={`Uploaded by ${item.username}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-48 rounded overflow-hidden bg-black">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      // safari mobile may not autoplay; but tapping wrapper will open preview
                      playsInline
                    />
                  </div>
                )}
              </div>

              <p className="text-sm mt-2 text-gray-200 italic">Uploaded by: {item.username}</p>

              {/* Delete button: stopPropagation so click doesn't open preview */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-2 mx-auto"
                >
                  <FaTrash /> Delete
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 text-sm">
          <button className="text-gray-400 hover:text-white" disabled={page === 1} onClick={() => setPage(page - 1)}>
            &lt; Prev
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setPage(index + 1)}
              className={`w-8 h-8 rounded ${page === index + 1 ? "bg-white text-black font-bold" : "bg-gray-700 text-white"}`}
            >
              {index + 1}
            </button>
          ))}
          <button className="text-gray-400 hover:text-white" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next &gt;
          </button>
        </div>
      )}

      {/* Modal Preview */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)} // klik background -> close
        >
          <div
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // klik konten tidak close
          >
            {selectedMedia.type === "image" ? (
              <Image
                src={selectedMedia.url}
                alt="Preview"
                width={1600}
                height={1200}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded"
                unoptimized={selectedMedia.url.startsWith("data:")}
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[90vh] max-w-[90vw] object-contain rounded"
              />
            )}

            <button
              className="absolute top-4 right-4 bg-white/90 text-black px-4 py-2 rounded hover:bg-white"
              onClick={() => setSelectedMedia(null)}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ isOpen: false, message: '', type: 'info' })}
      />

      {/* Custom Confirm Component */}
      <Confirm
        isOpen={confirm.isOpen}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ isOpen: false, message: '', onConfirm: () => {} })}
      />
    </div>
  );
}
