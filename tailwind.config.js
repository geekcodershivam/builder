/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#ffffff',
          'secondary': '#f8fafc',
          'tertiary': '#f1f5f9',
          'accent-cyan': '#0891b2',
          'accent-green': '#059669',
          'accent-orange': '#ea580c',
          'accent-yellow': '#ca8a04',
        },
        fontFamily: {
          'sans': ['Manrope', 'sans-serif'],
          'mono': ['JetBrains Mono', 'monospace'],
        },
      },
    },
    plugins: [],
  }