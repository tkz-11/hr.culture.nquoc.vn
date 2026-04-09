import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nquoc: {
          blue:    '#3b82f6',
          bg:      '#f8fafc',
          sidebar: '#ffffff',
          text:    '#1e293b',
          muted:   '#64748b',
          border:  '#f1f5f9',
          active:  '#f0f7ff',
          hr:      '#e53e3e',
          fit:     '#f43f5e',
          lead:    '#8b5cf6',
        },
      },
      fontFamily: {
        sans:   ['Manrope', 'sans-serif'],
        header: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
