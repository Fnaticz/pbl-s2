'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'
import Image from 'next/image'

interface MediaViewerProps {
  isOpen: boolean
  mediaUrl: string
  mediaType: 'image' | 'video'
  onClose: () => void
}

export default function MediaViewer({ isOpen, mediaUrl, mediaType, onClose }: MediaViewerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {mediaType === 'image' ? (
              <Image
                src={mediaUrl}
                alt="Full size image"
                width={1600}
                height={1200}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                unoptimized
                onError={(e) => {
                  console.error('Image load error:', mediaUrl)
                  e.currentTarget.src = '/placeholder-image.png'
                }}
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  console.error('Video load error:', mediaUrl)
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-3 transition-colors shadow-lg"
              aria-label="Close"
            >
              <FaTimes size={24} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

