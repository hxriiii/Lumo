/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Fredoka"', 'sans-serif'],
      },
      colors: {
        lumo: {
          yellow: '#FFD12E',
          'yellow-hover': '#F0C21A',
          blue: '#38BDF8',
          'blue-dark': '#0284C7',
          coral: '#FF6B6B',
          mint: '#34D399',
          purple: '#A78BFA',
          cream: '#FAF8F5',
          card: '#FFFFFF',
          dark: '#1E293B',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#38bdf8',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      boxShadow: {
        'pop': '4px 4px 0px 0px #1E293B',
        'pop-sm': '2.5px 2.5px 0px 0px #1E293B',
        'pop-lg': '6px 6px 0px 0px #1E293B',
        'pop-yellow': '4px 4px 0px 0px #FFD12E',
        'pop-coral': '4px 4px 0px 0px #FF6B6B',
        'pop-blue': '4px 4px 0px 0px #38BDF8',
      }
    },
  },
  plugins: [],
}
