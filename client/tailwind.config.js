/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can extend Tailwind's default colors here
        // to match your existing design system
        primary: {
          50: '#e8f4fd',
          100: '#bee5eb',
          500: '#3498db',
          600: '#2980b9',
          700: '#1f618d',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}

