/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff6f9',
          100: '#ffe9f0',
          200: '#ffd4e1',
          300: '#ffb9cf',
          400: '#f7b4c6', // main brand color
          500: '#ec93ac',
          600: '#d56c8b',
          700: '#b24b6c',
          800: '#8c3954',
          900: '#6b2b40',
        },
      },
    },
  },
  plugins: [],
}

