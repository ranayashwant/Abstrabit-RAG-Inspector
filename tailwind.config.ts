import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './server/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        surface: {
          DEFAULT: 'var(--surface)',
          subtle: 'var(--surface-subtle)',
          elevated: 'var(--surface-elevated)',
        },
        abstrabit: {
          purple: '#8B5CF6',
          purpleDark: '#7C3AED',
          purpleLight: '#F3E8FF',
          fuchsia: '#C026D3',
          darkBg: '#010614',
          darkSurface: '#0B1120',
          darkElevated: '#111827',
          darkSlate: '#020817',
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          neutral: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Geist Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['Geist Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        elevated: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        purpleGlow: '0 0 20px -3px rgba(139, 92, 246, 0.35)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
