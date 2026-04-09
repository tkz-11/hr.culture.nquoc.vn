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
  red:     'bg-red-100 text-red-800 border border-red-300',
  amber:   'bg-amber-100 text-amber-800 border border-amber-300',
  emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  blue:    'bg-blue-100 text-blue-800 border border-blue-300',
  indigo:  'bg-indigo-100 text-indigo-800 border border-indigo-300',
  slate:   'bg-slate-100 text-slate-700 border border-slate-300',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
}

export function Badge({ variant = 'slate', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
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
    high: 'CAO', medium: 'TRUNG BÌNH', low: 'THẤP', none: '—',
  }
  return { variant: map[level] ?? 'slate', label: labels[level] ?? level }
}
