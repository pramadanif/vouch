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
        'gradient-shine': 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, #1C4D8D 0px, transparent 50%), radial-gradient(at 80% 0%, #4988C4 0px, transparent 50%), radial-gradient(at 0% 50%, #0F2854 0px, transparent 50%)',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(15, 40, 84, 0.05)',
        'card': '0 10px 30px -5px rgba(15, 40, 84, 0.08)',
        'card-hover': '0 20px 40px -10px rgba(15, 40, 84, 0.15)',
        'glow': '0 0 20px rgba(73, 136, 196, 0.2)',
        'glow-lg': '0 0 40px rgba(73, 136, 196, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'button': '0 4px 14px 0 rgba(28, 77, 141, 0.35)',
        'button-hover': '0 6px 20px rgba(28, 77, 141, 0.45)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

