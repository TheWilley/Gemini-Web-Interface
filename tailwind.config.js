/** @type {import('tailwindcss').Config} */
import prose from '@tailwindcss/typography'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        background: '#1b1c1d',
        overlay: '#282a2c',
        highlight: '#333537',
        primary: '#1f3760',
        secondary: '#03dac6',
        text: '#a2a9b0',
        'text-strong': '#ffffff',
        border: '#333333',
      },
    },
    fontFamily: {
      sans: ['Roboto', 'Arial', 'sans-serif'],
    },
  },
  plugins: [prose],
};

