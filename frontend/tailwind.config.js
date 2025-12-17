/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Green Theme
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
          950: '#0c2817',
        },
        // Secondary Colors (Light Green)
        secondary: {
          50: '#f0fdf4',
          100: '#e8f5e9',
          200: '#c8e6c9',
          300: '#a5d6a7',
          400: '#81c784',
          500: '#66bb6a',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
          950: '#0d3d1a',
        },
        // Neutral/Background
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          950: '#121212',
        },
        // Dark backgrounds
        dark: {
          50: '#f8f9fa',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Semantic Surface Colors
        'primary-surface': '#0a3d2a',
        'primary-surface-light': '#1d6b47',
        'primary-surface-dark': '#0f4d2f',
        
        // Text & UI Colors
        'muted': '#a8d5ba',
        'muted-light': '#c8e6c9',
        'muted-dark': '#7db598',
        
        // Status Colors
        'warning': '#facc15',
        'error': '#ef4444',
        'info': '#38bdf8',
        'success': '#4ade80',
      },
      backgroundColor: {
        primary: '#15803d',
        'primary-light': '#22c55e',
        'primary-lighter': '#86efac',
        secondary: '#388e3c',
        'secondary-light': '#43a047',
        tertiary: '#166534',
        'bg-surface': '#0a3d2a',
        'bg-surface-light': '#1d6b47',
        'bg-surface-dark': '#0f4d2f',
      },
      textColor: {
        primary: '#15803d',
        'primary-light': '#22c55e',
        secondary: '#388e3c',
        'secondary-light': '#81c784',
        muted: '#a8d5ba',
        'muted-light': '#c8e6c9',
        'muted-dark': '#7db598',
        accent: '#22c55e',
      },
      borderColor: {
        primary: '#22c55e',
        'primary-light': '#86efac',
        secondary: '#81c784',
        'muted': '#388e3c',
      },
      backgroundImage: {
        'gradient-surface': 'linear-gradient(to bottom right, #0a3d2a, #1d6b47, #0f4d2f)',
      },
    },
  },
  plugins: [],
}

