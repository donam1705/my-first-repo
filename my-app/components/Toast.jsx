'use client';
import { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in">
      <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg min-w-[200px]">
        {message}
      </div>

      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
