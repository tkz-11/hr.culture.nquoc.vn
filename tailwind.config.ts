import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nquoc: {
          // Primary — Red (HR accent, chuyen_team_nquoc style)
          red:          '#e53e3e',
          'red-hover':  '#c53030',
          'red-light':  '#fff0f0',
          'red-border': '#fecaca',
          // Blue (secondary actions)
          blue:         '#1d4ed8',
          indigo:       '#4f46e5',
          // Backgrounds
          bg:           '#f5f6fa',
          surface:      '#ffffff',
          sidebar:      '#ffffff',   // White sidebar
          sidebarText:  '#5a6a85',
          sidebarMuted: '#94a3b8',
          sidebarActive:'#e53e3e',
          // Text
          text:         '#1a1a2e',
          muted:        '#94a3b8',
          // Borders
          border:       '#f0f0f0',
          'border-md':  '#ebebeb',
          // States
          active:       '#fff0f0',
          hover:        '#f8fafc',
          // Role accents
          hr:           '#e53e3e',
          lead:         '#6d28d9',
          // Semantic
          amber:        '#f59e0b',
          emerald:      '#10b981',
          rose:         '#e11d48',
        },
      },
      fontFamily: {
        sans:   ['Manrope', 'sans-serif'],
        header: ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        'card':      '0 1px 4px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.08)',
        'modal':     '0 20px 60px rgba(0,0,0,0.18)',
        'sidebar':   '2px 0 8px rgba(0,0,0,0.06)',
        'red-glow':  '0 3px 12px rgba(229,62,62,0.3)',
      },
      borderRadius: {
        'card': '16px',
        'modal':'18px',
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)',
        'scale-in':   'scaleIn 0.25s ease-out',
        'shimmer':    'shimmer 1.8s linear infinite',
        'pulse-red':  'pulseRed 2s ease infinite',
        'count-up':   'countUp 0.4s ease-out',
        'spin-slow':  'spin 0.7s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(229,62,62,0.4)' },
          '50%':     { boxShadow: '0 0 0 8px rgba(229,62,62,0)' },
        },
        countUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
