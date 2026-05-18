/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  // Preflight OFF — evita conflictos con el CSS reset de Angular Material
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ["'Space Grotesk'", 'Inter', 'sans-serif'],
        mono:    ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
      colors: {
        // ── MatchUp Design System — CSS variable aliases ───────────────────
        bg:          'var(--bg)',
        'bg-2':      'var(--bg-2)',
        surface:     'var(--surface)',
        'surface-2': 'var(--surface-2)',
        hairline:    'var(--hairline)',
        'hairline-2':'var(--hairline-2)',
        ink:         'var(--ink)',
        'ink-2':     'var(--ink-2)',
        'ink-muted': 'var(--ink-muted)',
        'ink-faint': 'var(--ink-faint)',
        accent:      'var(--accent)',
        'accent-ink':'var(--accent-ink)',
        'accent-dim':'var(--accent-dim)',
        success:     'var(--success)',
        warning:     'var(--warning)',
        danger:      'var(--danger)',
        info:        'var(--info)',
        'success-bg':'var(--success-bg)',
        'warning-bg':'var(--warning-bg)',
        'danger-bg': 'var(--danger-bg)',
        'info-bg':   'var(--info-bg)',
      },
      borderRadius: {
        sm:      '6px',
        DEFAULT: '10px',
        md:      '10px',
        lg:      '14px',
        xl:      '18px',
        '2xl':   '20px',
      },
      boxShadow: {
        sm:   '0 1px 3px rgba(0,0,0,0.08)',
        md:   '0 4px 12px rgba(0,0,0,0.12)',
        lg:   '0 10px 28px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}
