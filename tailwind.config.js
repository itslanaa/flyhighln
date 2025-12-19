/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          beige: '#E9E4D9',
          card: '#FFFDF5',
          pink: '#FFB7C5',
          blue: '#A0CED9',
        }
      },
    },
  },
  plugins: [],
}