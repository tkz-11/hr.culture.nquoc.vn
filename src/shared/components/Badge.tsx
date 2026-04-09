import React from 'react'

type BadgeVariant = 'red' | 'amber' | 'emerald' | 'blue' | 'indigo' | 'slate'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  red:     'bg-red-100 text-red-700 border border-red-200',
  amber:   'bg-amber-100 text-amber-700 border border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  blue:    'bg-blue-100 text-blue-700 border border-blue-200',
  indigo:  'bg-indigo-100 text-indigo-700 border border-indigo-200',
  slate:   'bg-slate-100 text-slate-600 border border-slate-200',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ variant = 'slate', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  )
}

// Convenience helpers
export function riskBadge(level: string) {
  const map: Record<string, BadgeVariant> = {
    high: 'red', medium: 'amber', low: 'blue', none: 'slate',
  }
  const labels: Record<string, string> = {
    high: 'HIGH', medium: 'MEDIUM', low: 'LOW', none: '—',
  }
  return { variant: map[level] ?? 'slate', label: labels[level] ?? level }
}
