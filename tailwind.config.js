/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clay: {
          bg: '#F0F4FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          muted: '#F8FAFC',
          border: '#E2E8F0',
          shadow: '#A0AFCD',
        },
        pastel: {
          indigo: '#6366F1',
          indigoDark: '#4F46E5',
          sky: '#0EA5E9',
          cyan: '#06B6D4',
          rose: '#F43F5E',
          emerald: '#10B981',
          amber: '#F59E0B',
          purple: '#A855F7',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'clay': '10px 14px 26px rgba(160, 175, 205, 0.2), -8px -8px 20px rgba(255, 255, 255, 0.95), inset -2px -2px 6px rgba(160, 175, 205, 0.08), inset 2px 2px 6px rgba(255, 255, 255, 0.9)',
        'clay-hover': '16px 24px 36px rgba(140, 160, 195, 0.28), -10px -10px 24px rgba(255, 255, 255, 0.98), inset -2px -2px 6px rgba(160, 175, 205, 0.06), inset 2px 2px 6px rgba(255, 255, 255, 0.95)',
        'clay-inset': 'inset 3px 3px 6px rgba(160, 175, 205, 0.22), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
        'clay-btn': '6px 8px 18px rgba(99, 102, 241, 0.25), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.12)',
        'clay-subtle': '6px 8px 16px rgba(160, 175, 205, 0.15), -5px -5px 12px rgba(255, 255, 255, 0.9)',
      },
    },
  },
  plugins: [],
}
