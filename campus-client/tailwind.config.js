/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'plum-dark': '#190019',
        'violet-deep': '#2B124C',
        'wine-muted': '#522B5B',
        'mauve-dusty': '#854F6C',
        'blush-soft': '#DFB6B2',
        'ivory-warm': '#FBE4D8',
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #190019 0%, #2B124C 100%)',
        'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      },
      borderRadius: {
        'luxury': '2rem',
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'soft': '0 10px 30px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}

