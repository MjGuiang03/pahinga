/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EAF3DE',
          100: '#C0DD97',
          200: '#97C459',
          300: '#80B33B',
          400: '#639922',
          500: '#4E8319',
          600: '#3B6D11',
          700: '#305C0E',
          800: '#27500A',
          900: '#173404',
          950: '#0E2202',
        },
        green: {
          50:  '#EAF3DE',
          100: '#C0DD97',
          200: '#97C459',
          400: '#639922',
          600: '#3B6D11',
          800: '#27500A',
          900: '#173404',
        },
        dark: {
          bg:      '#0a0a0a',
          card:    '#111111',
          surface: '#1a1a1a',
          border:  '#2a2a2a',
        },
        surface: {
          light: '#FFFFFF',
          'light-alt': '#F5F7F5',
          dark: '#111111',
          'dark-alt': '#1a1a1a',
          'dark-tertiary': '#222222',
        },
      },
      fontFamily: { 
        sans: ['Inter', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      borderRadius: { sm: '6px', md: '8px', lg: '12px', xl: '16px' },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.08)',
        modal: '0 8px 32px rgba(0,0,0,0.24)',
      },
    },
  },
  plugins: [],
}
