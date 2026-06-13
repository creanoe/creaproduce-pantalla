/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crea-navy': '#0f172a',
        'crea-blue': '#3b82f6',
      }
    },
  },
  plugins: [],
}