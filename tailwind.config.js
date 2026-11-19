/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // change these to your brand colours
        brand: { DEFAULT: '#2B59F0', dark: '#1E43C4', light: '#E8EEFE' },
      },
    },
  },
  plugins: [],
}
