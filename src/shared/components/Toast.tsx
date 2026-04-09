import React from 'react'
import type { Toast, ToastType } from '../hooks/useToast'

const typeClasses: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-nquoc-blue text-white',
}

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm
            ${typeClasses[toast.type]} animate-in slide-in-from-right-4 duration-200`}
        >
          <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center font-bold text-sm
            rounded-full bg-white/20">
            {typeIcons[toast.type]}
          </span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-white/70 hover:text-white transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
