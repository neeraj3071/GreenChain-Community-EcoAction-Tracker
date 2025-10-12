/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green-primary': '#10b981',
        'green-secondary': '#065f46',
        'eco-light': '#d1fae5',
        'eco-dark': '#064e3b'
      }
    },
  },
  plugins: [],
}