/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron:           '#F4A261',
        'saffron-dark':    '#E8762A',
        ivory:             '#FFF3E0',
        'ivory-dark':      '#FFECD2',
        pistachio:         '#A8D5BA',
        'pistachio-dark':  '#7DC49A',
        rose:              '#F7A8A8',
        'rose-dark':       '#E88888',
        cocoa:             '#4A2C2A',
        'cocoa-light':     '#7A5C5A',
        'gold-warm':       '#D4A017',
        // backward-compat aliases used by other pages
        primary:           '#F4A261',
        'primary-dark':    '#E8762A',
        accent:            '#A8D5BA',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans:  ['Inter', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow':     'spin-slow 24s linear infinite',
        'spin-slow-rev': 'spin-slow-rev 18s linear infinite',
      },
    },
  },
  plugins: [],
}
