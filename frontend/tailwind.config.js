/** @type {import('tailwindcss').Config} */

// Semantic colors come from CSS variables (src/index.css) so light/dark themes swap in one place.
// Every text/background pair used on the site is checked against WCAG AA (see docs/design.md).
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'), // page background
        surface: token('surface'), // cards, panels
        'surface-2': token('surface-2'), // chips, subtle fills
        fg: token('fg'), // primary text
        muted: token('muted'), // secondary text
        subtle: token('subtle'), // tertiary text / meta
        line: token('line'), // borders
        field: token('field'), // form control borders (3:1 contrast)
        accent: token('accent'), // links, accent text, focus rings
        'accent-bg': token('accent-bg'), // filled buttons (white text)
        'accent-soft': token('accent-soft'), // badges, tinted backgrounds
        'hero-from': token('hero-from'),
        'hero-to': token('hero-to'),
        brand: '#f7b4c6', // original pink, decorative only (never behind text)
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      scrollMargin: {
        nav: '5rem',
      },
    },
  },
  plugins: [],
}
