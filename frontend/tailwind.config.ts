import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1565c0',
        'primary-dark': '#628ecf',
        danger: '#e53935',
        surface: '#ffffff',
        'surface-muted': '#f5f7fb',
        border: '#d9e1ec',
        text: '#1f2a37',
        'text-soft': '#64748b',
        sidebar: '#0f2747',
        'sidebar-accent': '#1a3b67',
        success: '#2e7d32',
        warning: '#fb8c00',
      },
      boxShadow: {
        custom: '0 16px 40px rgba(15, 39, 71, 0.08)',
      },
    },
  },
  plugins: [],
}
export default config
