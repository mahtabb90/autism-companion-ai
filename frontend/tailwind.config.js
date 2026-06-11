/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        calm: {
          blue: {
            light: '#FAF7F2',   // Cozy Scandinavian warm cream background
            DEFAULT: '#D7E5F0', // Soft Sky Blue
            dark: '#3B4B72',    // Deep Slate Periwinkle
          },
          green: {
            light: '#EBF2EB',   // Cozy light mint
            DEFAULT: '#D5E5D5', // Soothing Sage Green
            dark: '#4E6A4E',    // Muted Forest/Spruce
          },
          lavender: {
            light: '#FAF8FB',
            DEFAULT: '#E5DDF0', // Muted Lilac
            dark: '#5E4975',
          },
          cream: {
            light: '#FAF6F0',
            DEFAULT: '#F3D9C9', // Soft Peach
            dark: '#8C5E47',    // Cozy Terracotta/Clay
          },
          charcoal: '#3A3A3A',  // Soft charcoal (safe for screen glare)
          gray: '#ECECEC',
        }
      },
      fontFamily: {
        sans: ['Lexend', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
