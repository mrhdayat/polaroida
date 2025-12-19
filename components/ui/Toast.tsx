"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100]"
        >
          <div className="flex items-center gap-3 px-6 py-4 bg-[#111111] text-white rounded-lg shadow-2xl min-w-[300px] border border-gray-800">
            {type === 'success' && <Check size={20} className="text-[#4CAF50]" />}
            {type === 'error' && <AlertCircle size={20} className="text-[#C2252B]" />}

            <span className="font-sans text-[14px] font-medium tracking-wide flex-grow">
              {message}
            </span>

            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
