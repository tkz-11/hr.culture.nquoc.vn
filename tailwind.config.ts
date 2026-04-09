import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nquoc: {
          // Primary — Indigo (upgraded from generic blue)
          blue:     '#4f46e5',
          indigo:   '#4f46e5',
          // Backgrounds
          bg:       '#f6f7fb',
          sidebar:  '#ffffff',
          // Text
          text:     '#1e293b',
          muted:    '#64748b',
          // Borders
          border:   '#e8ecf4',
          // States
          active:   '#eef2ff',
          hover:    '#f0f4ff',
          // Role colors
          hr:       '#e11d48',    // Rose — Stress/Risk
          fit:      '#f43f5e',
          lead:     '#8b5cf6',    // Violet — Leader  
          // Semantic
          rose:     '#e11d48',
          emerald:  '#10b981',
          fuchsia:  '#d946ef',
          amber:    '#f59e0b',
        },
      },
      fontFamily: {
        sans:   ['Manrope', 'sans-serif'],
        header: ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        'nquoc':       '0 1px 3px rgba(79,70,229,0.08), 0 8px 32px rgba(79,70,229,0.06)',
        'nquoc-md':    '0 4px 24px rgba(79,70,229,0.12), 0 1px 4px rgba(79,70,229,0.06)',
        'nquoc-lg':    '0 8px 40px rgba(79,70,229,0.16)',
        'rose-soft':   '0 4px 20px rgba(225,29,72,0.12)',
        'emerald-soft':'0 4px 20px rgba(16,185,129,0.12)',
        'card':        '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)',
        'card-hover':  '0 2px 4px rgba(15,23,42,0.06), 0 12px 32px rgba(15,23,42,0.08)',
      },
      backgroundImage: {
        'gradient-indigo': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-rose':   'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
        'gradient-dark':   'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      },
      animation: {
        'wave':        'wave 2.5s infinite',
        'float':       'float 3s ease-in-out infinite',
        'pulse-ring':  'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'slide-up':    'slideUp 0.4s ease-out',
        'fade-in':     'fadeIn 0.3s ease-out',
        'scale-in':    'scaleIn 0.25s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
      },
      keyframes: {
        wave: {
          '0%':   { transform: 'rotate(0deg)' },
          '15%':  { transform: 'rotate(14deg)' },
          '30%':  { transform: 'rotate(-8deg)' },
          '40%':  { transform: 'rotate(14deg)' },
          '50%':  { transform: 'rotate(-4deg)' },
          '60%':  { transform: 'rotate(10deg)' },
          '70%':  { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(225,29,72,0.4)' },
          '70%':  { transform: 'scale(1)',    boxShadow: '0 0 0 8px rgba(225,29,72,0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(225,29,72,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.08)' },
          '70%':  { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
