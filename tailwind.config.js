export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base palette - deep industrial slate (dark mode)
        slate: {
          950: '#0a0c10',
          900: '#0f1218',
          850: '#141820',
          800: '#1a1f2a',
          750: '#212736',
          700: '#2a3142',
          600: '#3d4559',
          500: '#525c73',
          400: '#6b7590',
          300: '#8a94ad',
          200: '#c1c7d4',
          100: '#e2e5eb',
          50: '#f5f6f8',
        },
        // Primary accent - cyan/teal
        cyber: {
          50: '#e6fcfc',
          100: '#c0f8f8',
          200: '#86f0f0',
          300: '#4de6e8',
          400: '#22d3db',
          500: '#0cb8c4',
          600: '#0a97a4',
          700: '#0d7885',
          800: '#115f6b',
          900: '#134e59',
        },
        // Status colors
        status: {
          online: '#22c55e',
          offline: '#6b7280',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#0cb8c4',
        }
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 4s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 3s',
        'reveal-up': 'revealUp 0.6s ease-out forwards',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s step-end infinite',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(12, 184, 196, 0.3), 0 0 10px rgba(12, 184, 196, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(12, 184, 196, 0.5), 0 0 20px rgba(12, 184, 196, 0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        counter: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(12, 184, 196, 0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(12, 184, 196, 0.03) 1px, transparent 1px)`,
        'grid-pattern-dense': `linear-gradient(rgba(12, 184, 196, 0.05) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(12, 184, 196, 0.05) 1px, transparent 1px)`,
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid': '24px 24px',
        'grid-dense': '12px 12px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(12, 184, 196, 0.3)',
        'glow': '0 0 20px rgba(12, 184, 196, 0.4)',
        'glow-lg': '0 0 30px rgba(12, 184, 196, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(12, 184, 196, 0.1)',
        'panel': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
};
