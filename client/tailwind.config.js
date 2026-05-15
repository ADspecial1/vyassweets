/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // VYAS brand palette — matches the shop logo
        crimson:           '#C41230',
        'crimson-dark':    '#9B0E25',
        cream:             '#FFF8F0',
        'cream-dark':      '#FFEEDD',
        gold:              '#D4AF37',
        'gold-dark':       '#B8962A',
        'gold-light':      '#F0CE6A',
        dark:              '#1A0808',
        'dark-light':      '#5C1818',
        // Backward-compat aliases — old page classes now map to brand colors
        saffron:           '#C41230',
        'saffron-dark':    '#9B0E25',
        ivory:             '#FFF8F0',
        'ivory-dark':      '#FFEEDD',
        pistachio:         '#D4AF37',
        'pistachio-dark':  '#B8962A',
        rose:              '#F0CE6A',
        'rose-dark':       '#D4AF37',
        cocoa:             '#1A0808',
        'cocoa-light':     '#5C1818',
        'gold-warm':       '#D4AF37',
        primary:           '#C41230',
        'primary-dark':    '#9B0E25',
        accent:            '#D4AF37',
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
