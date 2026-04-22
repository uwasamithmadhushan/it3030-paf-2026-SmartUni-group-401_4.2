/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luna: {
          aqua: '#A7EBF2',
          cyan: '#54ACBF',
          steel: '#26658C',
          navy: '#023859',
          midnight: '#011C40',
        },
        text: {
          muted: '#8FBACC',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'luna-gradient': 'linear-gradient(135deg, #011C40 0%, #023859 100%)',
        'luna-glass': 'linear-gradient(135deg, rgba(167, 235, 242, 0.05) 0%, rgba(167, 235, 242, 0.01) 100%)',
      },
      borderRadius: {
        'luxury': '2rem',
      },
      boxShadow: {
        'luna-glow': '0 0 20px rgba(167, 235, 242, 0.15)',
        'luna-glow-strong': '0 0 40px rgba(167, 235, 242, 0.3)',
      }
    },
  },
  plugins: [],
}
