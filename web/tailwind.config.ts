import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cloud: {
          50: '#f5f7ff',
          100: '#edf1fe',
          200: '#dbe3fd',
          300: '#c2cdfb',
          400: '#9facf7',
          500: '#7b88f2',
          600: '#5f6ae6',
          700: '#4e58cd',
          800: '#424aa8',
          900: '#3a4188'
        }
      }
    },
  },
  plugins: [],
}
export default config
