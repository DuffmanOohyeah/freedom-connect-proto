/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'main-menu': '0px 0px 6px 0px rgba(0,0,0,0)',
        // liam
        'tile-shadow': '0px 0px 50px 0px rgba(0,0,0,0.02)',
      },
      colors: {
        'aqua-haze': {
          DEFAULT: '#F8FAFB',
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FFFFFF',
          400: '#FFFFFF',
          500: '#F8FAFB',
          600: '#D4E0E7',
          700: '#B1C7D2',
          800: '#8DADBE',
          900: '#6994A9',
        },
        shark: {
          DEFAULT: '#1B1C1F',
          50: '#707581',
          100: '#676B76',
          200: '#545760',
          300: '#41434B',
          400: '#2E3035',
          450: '#282B32',
          500: '#1B1C1F',
          600: '#010101',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        },
        'jagged-ice': {
          DEFAULT: '#C3E9E6',
          50: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FFFFFF',
          400: '#E1F4F2',
          500: '#C3E9E6',
          550: '#ABD8D4',
          600: '#9ADAD5',
          700: '#71CBC4',
          800: '#48BCB3',
          900: '#37958E',
        },
        'black-squeeze': {
          DEFAULT: '#E1F4F3',
          50: '#F4FBFA',
          100: '#E1F4F3',
          200: '#BCE6E4',
          300: '#96D9D5',
          400: '#71CBC6',
          500: '#4CBDB7',
          600: '#399D97',
          700: '#2C7773',
          800: '#1E524F',
          900: '#102D2B',
        },
        'placeholder-text': '#A5A5A5',
        'placeholder-bg': '#F6F8F9',
        'score-green': '#E1F4F3',
        'score-yellow': '#FFFCE4',
        'score-yellow-darker': '#FFECCF',
        'score-red': '#FAD7E0',
        divider: '#E3E3E3',
        // 'main-menu-bg': '#1B1C1F',
        // 'main-menu-hover': '#282B32',
        // 'main-menu-text': '#ffffff',
        // 'sub-menu-bg': '#C3E9E6',
        // 'sub-menu-hover': '#ABD8D4',
        // 'sub-menu-text': '#1B1C1F',
        // 'page-bg': '#F8FAFB',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
