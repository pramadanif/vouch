/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#0F2854',   // Deepest Blue/Navy
          secondary: '#475569', // Slate 600 (Neutral Text)
          action: '#1C4D8D',    // Mid-Dark Blue (Primary Buttons)
          actionHover: '#0F2854', // Hover State
          accent: '#4988C4',    // Mid-Light Blue (Icons/Secondary)
          ice: '#BDE8F5',       // Very Light Blue (Backgrounds/Accents)
          surface: '#FFFFFF',   // Pure White
          surfaceHighlight: '#F8FAFC', // Very Light Grey
          border: '#E2E8F0',    // Slate 200
          white: '#FFFFFF',
        }
      },
      backgroundImage: {
        'gradient-corporate': 'linear-gradient(135deg, #0F2854 0%, #1C4D8D 100%)',
        'gradient-glow': 'radial-gradient(circle at center, #1C4D8D 0%, #0F2854 100%)',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(15, 40, 84, 0.05)',
        'card': '0 10px 30px -5px rgba(15, 40, 84, 0.08)',
        'glow': '0 0 20px rgba(73, 136, 196, 0.2)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
