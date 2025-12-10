'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-primary',
  }[type];

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all duration-300",
        bgColor,
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      {message}
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}
