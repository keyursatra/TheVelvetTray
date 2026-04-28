import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory:   '#F6F1E7',
        crimson: { DEFAULT: '#7A1F2B', 700: '#631722' },
        gold:    { DEFAULT: '#B08542', 700: '#8E6B33' },
        ink:     { DEFAULT: '#1B1410', 70: 'rgba(27,20,16,0.7)', 50: 'rgba(27,20,16,0.5)', 10: 'rgba(27,20,16,0.1)' },
        paper:   '#FAF7EF',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
export default config;
