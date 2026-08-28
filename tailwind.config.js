/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        digicon: {
          primary: '#007AFF',
          secondary: '#5856D6',
          accent: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#5AC8FA',
          eco: '#10B981',
          violet: '#8B5CF6',
          gold: '#FFD166',
          steel: '#C9D6E8',
          ink: '#050710',
        },
        glass: {
          ultraThin: 'rgba(255, 255, 255, 0.04)',
          thin: 'rgba(255, 255, 255, 0.08)',
          regular: 'rgba(255, 255, 255, 0.12)',
          thick: 'rgba(255, 255, 255, 0.18)',
          chrome: 'rgba(255, 255, 255, 0.25)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text',
          'Inter', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
      fontSize: {
        /* fluid, mobile-first display scale — one source of truth for headings */
        'display-sm': ['clamp(1.6rem, 4.6vw, 2.15rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.85rem, 5.4vw, 2.6rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(2.1rem, 5.6vw, 3.4rem)', { lineHeight: '1.03', letterSpacing: '-0.03em' }],
        lede: ['clamp(1rem, 2.6vw, 1.2rem)', { lineHeight: '1.65' }],
      },
      borderRadius: {
        'glass-sm': '8px',
        'glass-md': '12px',
        'glass-lg': '16px',
        'glass-xl': '20px',
        'glass-2xl': '24px',
        'glass-3xl': '32px',
      },
      backdropBlur: {
        'glass-thin': '20px',
        'glass-regular': '30px',
        'glass-thick': '40px',
        'glass-chrome': '50px',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom, 0px)',
        appnav: 'var(--appnav-h)',
      },
      maxWidth: {
        prose: '68ch',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring-bounce': 'springBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float-soft': 'floatSoft 6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-ring': 'pulseRing 2.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
