import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        tajweed: {
          qalqalah: '#4ade80',
          ghunna: '#fbbf24',
          madd: '#60a5fa',
          idgham: '#a78bfa',
          ikhfa: '#fb923c',
        }
      },
      fontFamily: {
        arabic: ['Amiri', 'Traditional Arabic', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
