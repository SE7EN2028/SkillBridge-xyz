/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50:  '#f6f7fb',
          100: '#eceff5',
          200: '#d5dae6',
          300: '#aab1c4',
          400: '#7a839c',
          500: '#525a73',
          600: '#3a4159',
          700: '#262c40',
          800: '#171b2b',
          900: '#0b0e1c',
          950: '#05070f',
        },
        brand: {
          50:  '#eef9ff',
          100: '#d9f1ff',
          200: '#bae5ff',
          300: '#85d2ff',
          400: '#48b6ff',
          500: '#1f93ff',
          600: '#0974ef',
          700: '#085bc3',
          800: '#0c4d9c',
          900: '#10427d',
        },
        accent: {
          400: '#ffbf66',
          500: '#ff9f1c',
          600: '#e07f00',
        },
      },
      boxShadow: {
        glow: '0 0 80px -20px rgba(31,147,255,0.65)',
        card: '0 10px 40px -10px rgba(11,14,28,0.18)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'mesh': 'radial-gradient(at 12% 18%, rgba(31,147,255,0.35) 0px, transparent 50%), radial-gradient(at 85% 12%, rgba(255,159,28,0.28) 0px, transparent 55%), radial-gradient(at 50% 95%, rgba(31,147,255,0.22) 0px, transparent 60%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
