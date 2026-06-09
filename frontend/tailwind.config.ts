import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#011478',
          DEFAULT: '#011478',
          light: '#fefefe',
          50: '#e8ecf7',
          100: '#d1d9ef',
          200: '#a3b5df',
          300: '#7591cf',
          400: '#476cbf',
          500: '#011478',
          600: '#001060',
          700: '#000c48',
          800: '#000830',
          900: '#000418',
        },
        accent: {
          DEFAULT: '#f9cd2a',
          50: '#fef9e7',
          100: '#fef3d0',
          200: '#fde7a1',
          300: '#fde056',
          400: '#f9cd2a',
          500: '#e6b818',
          600: '#c29a12',
          700: '#9e7c0c',
          800: '#7a5e06',
          900: '#564000',
        },
        brand: {
          blue: '#011478',
          white: '#fefefe',
          yellow: '#f9cd2a',
        }
      },
      fontFamily: {
        script: ['ITC Edwardian Script', 'cursive'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(1, 20, 120, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(1, 20, 120, 0.1), 0 1px 2px -1px rgba(1, 20, 120, 0.1)',
        'md': '0 4px 6px -1px rgba(1, 20, 120, 0.1), 0 2px 4px -2px rgba(1, 20, 120, 0.1)',
        'lg': '0 10px 15px -3px rgba(1, 20, 120, 0.1), 0 4px 6px -4px rgba(1, 20, 120, 0.1)',
        'xl': '0 20px 25px -5px rgba(1, 20, 120, 0.1), 0 8px 10px -6px rgba(1, 20, 120, 0.1)',
        '2xl': '0 25px 50px -12px rgba(1, 20, 120, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(1, 20, 120, 0.05)',
        'soft': '0 2px 8px rgba(1, 20, 120, 0.08), 0 4px 16px rgba(1, 20, 120, 0.04)',
        'glow': '0 0 20px rgba(249, 205, 42, 0.3)',
        'card': '0 4px 12px rgba(1, 20, 120, 0.08), 0 2px 4px rgba(1, 20, 120, 0.04)',
      },
      transitionDuration: {
        'DEFAULT': '200ms',
        'fast': '150ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      }
    }
  },
  plugins: []
};

export default config;
