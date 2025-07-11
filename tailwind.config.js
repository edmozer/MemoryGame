/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./memory_game.js",
    "./style.css"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'game-bg': "url('/assets/background.jpg')"
      }
    }
  },
  plugins: []
}
