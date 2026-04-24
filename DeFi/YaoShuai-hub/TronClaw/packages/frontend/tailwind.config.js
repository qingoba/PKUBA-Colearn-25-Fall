/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { 0: '#09090b', 1: '#0c0c0f', 2: '#141419', 3: '#1a1a21', 4: '#222230' },
        brand: { DEFAULT: '#f97316', light: '#fb923c', dim: '#ea580c' },
        accent: { DEFAULT: '#4ade80', dim: '#22c55e' },
        text: { 0: '#fafafa', 1: '#e4e4e7', 2: '#a1a1aa', 3: '#52525b' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
