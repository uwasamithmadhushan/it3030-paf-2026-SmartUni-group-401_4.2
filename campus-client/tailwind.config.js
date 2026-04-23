/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        primary: {
          light: '#ecfdf5',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        secondary: {
          light: '#f8fafc',
          DEFAULT: '#334155',
          dark: '#0f172a',
        },
        accent: {
          light: '#fffbeb',
          DEFAULT: '#F59E0B',
          dark: '#b45309',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
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
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'scale-up': 'scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-up': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
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
