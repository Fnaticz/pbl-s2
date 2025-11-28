'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa'

interface AlertProps {
  isOpen: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
}

export default function Alert({ isOpen, message, type = 'info', onClose }: AlertProps) {
  const icons = {
    success: FaCheckCircle,
    error: FaTimesCircle,
    warning: FaExclamationCircle,
    info: FaInfoCircle,
  }

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  const Icon = icons[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white rounded-lg shadow-2xl border-2 max-w-md w-full p-6 ${colors[type]}`}
            >
              <div className="flex items-start gap-4">
                <Icon className={`text-3xl flex-shrink-0 ${iconColors[type]}`} />
                <div className="flex-1">
                  <p className="text-lg font-semibold mb-2">{message}</p>
                </div>
                <button
                  onClick={onClose}
                  className={`flex-shrink-0 ${iconColors[type]} hover:opacity-70 transition-opacity`}
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={onClose}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    type === 'success'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : type === 'error'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

