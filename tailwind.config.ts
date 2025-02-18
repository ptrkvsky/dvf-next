import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004aad',
          light: '#3366cc',
          dark: '#00337a',
          hover: '#003d99',
          muted: '#99bbff',
        },
        secondary: {
          DEFAULT: '#f7931e',
          light: '#f9a73e',
          dark: '#e57c00',
          hover: '#db7000',
          muted: '#fbc48a',
        },
        background: {
          DEFAULT: '#f8f9fa',
          dark: '#1e1e1e',
          muted: '#eaeaea',
        },
        body: {
          DEFAULT: '#00224f',
          light: '#666',
          dark: '#ffffff',
          muted: '#6c757d',
        },
        border: '#e5e7eb',
        white: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', ...defaultTheme.fontFamily.sans],
        serif: ['Merriweather', 'Georgia', ...defaultTheme.fontFamily.serif],
      },
      boxShadow: {
        soft: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        strong: '0px 6px 15px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      transitionTimingFunction: {
        'in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        pulseSoft: 'pulseSoft 2s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
