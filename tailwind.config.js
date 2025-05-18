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
        primary: {
          DEFAULT: 'var(--primary-light)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
          lighter: 'var(--primary-lighter)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)'
        },
        accent: {
          DEFAULT: 'var(--accent-light)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
          lighter: 'var(--accent-lighter)',
          hover: 'var(--accent-hover)',
          active: 'var(--accent-active)'
        },
        // Arka plan renkleri
        background: {
          light: 'var(--background-light)',
          dark: 'var(--background-dark)'
        },
        // Metin renkleri
        text: {
          light: 'var(--text-light)',
          dark: 'var(--text-dark)'
        }
      }
    },
  },
  plugins: [],
} 