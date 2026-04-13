/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        reso: {
          deep: '#190019',    // Darkest Purple (Text)
          dark: '#2B124C',    // Deep Violet (Sidebar)
          royal: '#522B5B',   // Rich Purple (Buttons)
          mauve: '#854F6C',   // Muted Pink (Accents)
          peach: '#DFB6B2',   // Soft Pink (Highlights)
          pale: '#FBE4D8',    // Lightest Peach (Background)
        },
        tcs: {
          brand: '#5F259F',   // TCS Corporate Blue/Purple
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'wave-slow': 'wave 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}