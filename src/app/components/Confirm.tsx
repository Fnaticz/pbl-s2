'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaQuestionCircle, FaCheck, FaTimes } from 'react-icons/fa'

interface ConfirmProps {
  isOpen: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function Confirm({ isOpen, message, onConfirm, onCancel }: ConfirmProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onCancel}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <FaQuestionCircle className="text-3xl text-blue-600 flex-shrink-0" />
                <p className="text-lg font-semibold text-gray-800 flex-1">{message}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-6 py-2 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors flex items-center gap-2"
                >
                  <FaTimes size={16} />
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  className="px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2"
                >
                  <FaCheck size={16} />
                  Ya
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

