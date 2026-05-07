/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  // Preflight OFF — evita conflictos con el CSS reset de Angular Material
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // ── Apex Design System ─────────────────────────────────────────────
        blue: {
          DEFAULT: '#0066CC',
          50:  '#E8F1FF',
          100: '#C6D9FF',
          500: '#0066CC',
          600: '#005AB5',
          700: '#004EA3',
        },
        energy: {
          DEFAULT: '#FF6B2B',
          50:  '#FFF0E8',
          500: '#FF6B2B',
          600: '#E85A1A',
        },
        ink: {
          DEFAULT: '#0A0A0F',
          80: '#1C1C1E',
          60: '#48484A',
          40: '#8E8E93',
          20: '#C7C7CC',
          10: '#E5E5EA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F9F9FB',
          3: '#F2F2F7',
        },
        success: '#28CD41',
        warning: '#FF9500',
        danger:  '#FF3B30',
      },
      borderRadius: {
        sm:    '6px',
        DEFAULT: '10px',
        md:    '10px',
        lg:    '14px',
        xl:    '20px',
        '2xl': '28px',
      },
      boxShadow: {
        sm:    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        md:    '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)',
        lg:    '0 10px 28px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
        hover: '0 16px 40px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.07)',
        blue:  '0 4px 16px rgba(0,102,204,0.28)',
      },
    },
  },
  plugins: [],
}
