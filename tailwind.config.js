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
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'glass-sm': '8px',
        'glass-md': '12px',
        'glass-lg': '16px',
        'glass-xl': '20px',
        'glass-2xl': '24px',
      },
      backdropBlur: {
        'glass-thin': '20px',
        'glass-regular': '30px',
        'glass-thick': '40px',
        'glass-chrome': '50px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring-bounce': 'springBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};
