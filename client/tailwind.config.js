/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        brand: {
          50: '#edf8f3', 100: '#d6f0e4', 200: '#afe0cc', 300: '#78c8ab',
          400: '#40a982', 500: '#238a68', 600: '#176f55', 700: '#145946',
          800: '#12473a', 900: '#0f3b32', 950: '#06231f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.06), 0 8px 24px rgb(15 23 42 / 0.06)',
        lift: '0 16px 40px rgb(15 23 42 / 0.12)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: { themes: ['light', 'dark'], logs: false },
};
