/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0D1B2A',
        cyan: '#00B4D8',
        background: '#F8FAFC',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
