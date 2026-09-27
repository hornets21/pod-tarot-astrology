/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          900: '#07050d',
          800: '#120d24',
          700: '#1f153a',
          gold: '#e6c875',
          darkgold: '#9a7b2c',
          purple: '#8b5cf6',
          glow: '#c084fc'
        }
      },
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
        cinzel: ['Cinzel', 'serif']
      }
    }
  },
  plugins: []
};
