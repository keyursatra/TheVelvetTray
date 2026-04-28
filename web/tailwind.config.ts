import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '2rem', lg: '3rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        ivory:   { DEFAULT: '#F6F1E7', 50: '#FBF8F1', 100: '#F6F1E7', 200: '#EDE4D0' },
        crimson: { DEFAULT: '#7A1F2B', 50: '#F3E0E2', 100: '#E6BFC3', 600: '#7A1F2B', 700: '#631722', 800: '#4C1019' },
        gold:    { DEFAULT: '#B08542', 50: '#F4EAD6', 100: '#E7D3A8', 600: '#B08542', 700: '#8E6B33' },
        ink:     { DEFAULT: '#1B1410', 70: 'rgba(27,20,16,0.7)', 50: 'rgba(27,20,16,0.5)' },
        linen:   '#EFE7D6',
        sand:    '#E7DDC7',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.75rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'hero':    ['clamp(2rem, 3.5vw, 3rem)',    { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'eyebrow': ['0.72rem',                     { lineHeight: '1',    letterSpacing: '0.22em' }],
      },
      letterSpacing: { widest: '0.22em' },
      boxShadow: {
        tray: '0 1px 0 rgba(27,20,16,0.06), 0 20px 60px -20px rgba(27,20,16,0.18)',
      },
      transitionTimingFunction: { velvet: 'cubic-bezier(.2,.6,.2,1)' },
    },
  },
  plugins: [],
};

export default config;
