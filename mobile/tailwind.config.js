/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // --- Backgrounds ---
        bg: {
          DEFAULT: '#FAFAF8',
          surface: '#FFFFFF',
          elevated: '#F5F2EC',
          overlay: 'rgba(20, 16, 12, 0.52)',
        },
        // --- Borders ---
        border: {
          DEFAULT: '#E8E2D9',
          subtle: '#F0EBE2',
          strong: '#C8BFB4',
        },
        // --- Text ---
        text: {
          DEFAULT: '#1C1917',
          2: '#6B6360',
          3: '#A8A09A',
          4: '#C4BCB5',
          inv: '#FAFAF8',
        },
        // --- Brand: warm terracotta / cooking clay ---
        brand: {
          DEFAULT: '#C8481C',
          hover: '#B83D14',
          light: '#FCE9E2',
          muted: '#F5D0C0',
          50: '#FFF5F2',
        },
        // --- Semantic ---
        success: {
          DEFAULT: '#15803D',
          bg: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#B45309',
          bg: '#FFFBEB',
        },
        info: {
          DEFAULT: '#1D4ED8',
          bg: '#EFF6FF',
        },
        // --- Chat ---
        user: {
          bubble: '#1C1917',
          text: '#F5F2EC',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        // px values for cross-platform consistency (no rem)
        '2xs': '10px',
        xs: '11px',
        sm: '13px',
        base: '15px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '22px',
        '3xl': '26px',
        '4xl': '30px',
        '5xl': '36px',
      },
      lineHeight: {
        tight: '1.25',
        snug: '1.4',
        normal: '1.6',
        relaxed: '1.75',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(28,25,23,0.06)',
        sm: '0 1px 3px rgba(28,25,23,0.08), 0 1px 2px rgba(28,25,23,0.04)',
        md: '0 4px 12px rgba(28,25,23,0.1), 0 2px 4px rgba(28,25,23,0.04)',
        lg: '0 8px 24px rgba(28,25,23,0.12), 0 4px 8px rgba(28,25,23,0.06)',
        xl: '0 20px 40px rgba(28,25,23,0.16), 0 8px 16px rgba(28,25,23,0.08)',
      },
      spacing: {
        // Mobile layout constants
        'safe-bottom': '34px',
        'header-h': '44px',
        'appbar-h': '52px',
        'mobile-w': '390px',
      },
      transitionDuration: {
        fast: '100ms',
        base: '180ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
};
