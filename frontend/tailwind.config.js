/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  // Preflight OFF — evita conflictos con el CSS reset de Angular Material
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Paleta corporativa MatchUp — sincronizada con el tema M3
        primary: {
          DEFAULT: '#1565C0',   // --mu-primary
          light:   '#1E88E5',   // --mu-primary-light
          dark:    '#0D47A1',
        },
        accent: {
          DEFAULT: '#F57C00',   // --mu-accent
          light:   '#FFA726',   // --mu-accent-light
          dark:    '#E65100',
        },
        surface: '#FFFFFF',
        'mu-bg':  '#F5F5F5',
      },
    },
  },
  plugins: [],
}
