/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#09090b',
        secondary: '#18181b',
        surface: '#27272a',
        accent: '#e4e4e7',
        'accent-light': '#ffffff',
      },
    },
  },
  plugins: [],
};

