import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          light: '#64748b',
          DEFAULT: '#334155',
          dark: '#1e293b',
        },
        secondary: {
          light: '#5eead4',
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
        },
        accent: {
          light: '#818cf8',
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
      },
    },
  },
  plugins: [],
} 