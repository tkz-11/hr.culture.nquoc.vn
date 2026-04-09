import React from 'react'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon = '📭', title, description, action, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl mb-5">
        {icon}
      </div>
      <h3 className="text-base font-black text-slate-900 font-header mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
      {!action && actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-6 py-3 bg-[#0f172a] text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-[0.97]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
