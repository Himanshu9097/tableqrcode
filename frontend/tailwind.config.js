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
        blinkit: {
          yellow: '#F5D63D',
          green: '#0C831F',
          dark: '#1C1C1C'
        },
        primary: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 
          800: '#065f46', 900: '#064e3b'
        }
      },
      animation: {
        'bounce-soft': 'bounceSoft 3s infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '105%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translate(0, 20px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
