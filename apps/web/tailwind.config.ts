import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // BuffrSign Brand Colors
      colors: {
        // Primary Brand Blue
        'brand-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Secondary Namibian Gold
        'namibian-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Cultural Accents
        'desert-sand': '#d2b48c',
        'savanna-green': '#8fbc8f',
        'sunset-orange': '#ff7f50',
        // Semantic Colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      // Typography Scale
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      fontFamily: {
        'primary': ['Inter', 'system-ui', 'sans-serif'],
        'secondary': ['Poppins', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      // Spacing System
      spacing: {
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
      },
      // Component Spacing
      gap: {
        'tight': '0.5rem',
        'normal': '1rem',
        'relaxed': '1.5rem',
        'loose': '2rem',
      },
      // Border Radius
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      // Shadows
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      // Animation Durations
      transitionDuration: {
        'micro': '150ms',
        'short': '300ms',
        'medium': '500ms',
        'long': '800ms',
      },
      // Container
      maxWidth: {
        'container': '1280px',
      },
      // Custom Utilities
      backgroundImage: {
        'desert-gradient': 'linear-gradient(135deg, #d2b48c 0%, #f59e0b 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #ff7f50 0%, #f59e0b 100%)',
        'savanna-gradient': 'linear-gradient(135deg, #8fbc8f 0%, #10b981 100%)',
      },
    },
  },
  plugins: [
    require('daisyui'),
    // Custom plugin for BuffrSign components
    function({ addComponents, theme }: any) {
      addComponents({
        // Document Card Component
        '.document-card': {
          display: 'flex',
          alignItems: 'center',
          padding: theme('spacing.6'),
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.card'),
          transition: 'all 300ms ease-in-out',
          '&:hover': {
            boxShadow: theme('boxShadow.elevated'),
            transform: 'translateY(-2px)',
          },
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
          },
        },
        // Signature Field Component
        '.signature-field': {
          border: '2px dashed',
          borderColor: theme('colors.brand-blue.200'),
          borderRadius: theme('borderRadius.md'),
          padding: theme('spacing.4'),
          cursor: 'pointer',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            borderColor: theme('colors.brand-blue.400'),
            backgroundColor: theme('colors.brand-blue.50'),
          },
          '&.filled': {
            borderColor: theme('colors.success'),
            backgroundColor: theme('colors.success'),
            color: theme('colors.white'),
          },
          '&.required': {
            borderColor: theme('colors.error'),
            backgroundColor: theme('colors.error'),
            color: theme('colors.white'),
          },
        },
        // Compliance Indicator Component
        '.compliance-indicator': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.2'),
          padding: theme('spacing.2'),
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          '&.compliant': {
            backgroundColor: theme('colors.success'),
            color: theme('colors.white'),
          },
          '&.needs-review': {
            backgroundColor: theme('colors.warning'),
            color: theme('colors.white'),
          },
          '&.non-compliant': {
            backgroundColor: theme('colors.error'),
            color: theme('colors.white'),
          },
        },
        // Progress Steps Component
        '.progress-steps': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme('spacing.8'),
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: theme('spacing.4'),
          },
        },
        '.step-indicator': {
          display: 'flex',
          alignItems: 'center',
          gap: theme('spacing.2'),
          '&.active': {
            color: theme('colors.brand-blue.600'),
            fontWeight: theme('fontWeight.semibold'),
          },
          '&.completed': {
            color: theme('colors.success'),
          },
          '&.pending': {
            color: theme('colors.gray.400'),
          },
        },
        // Button Components
        '.btn-primary': {
          backgroundColor: theme('colors.brand-blue.600'),
          color: theme('colors.white'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.brand-blue.700'),
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-secondary': {
          backgroundColor: 'transparent',
          color: theme('colors.brand-blue.600'),
          border: `2px solid ${theme('colors.brand-blue.600')}`,
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.brand-blue.50'),
            transform: 'translateY(-1px)',
          },
        },
        // Form Components
        '.form-input': {
          width: '100%',
          padding: theme('spacing.3'),
          border: `1px solid ${theme('colors.gray.300')}`,
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.base'),
          transition: 'all 200ms ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.brand-blue.500'),
            boxShadow: `0 0 0 3px ${theme('colors.brand-blue.100')}`,
          },
          '&.error': {
            borderColor: theme('colors.error'),
            boxShadow: `0 0 0 3px ${theme('colors.error')}20`,
          },
        },
        '.form-label': {
          display: 'block',
          marginBottom: theme('spacing.2'),
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.gray.700'),
        },
      })
    },
  ],
  daisyui: {
    themes: [
      {
        buffrsign: {
          "primary": "#2563eb", // brand-blue-600
          "secondary": "#f59e0b", // namibian-gold-500
          "accent": "#8fbc8f", // savanna-green
          "neutral": "#64748b", // slate-500
          "base-100": "#ffffff",
          "info": "#3b82f6", // brand-blue-500
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      {
        buffrsignDark: {
          "primary": "#60a5fa", // brand-blue-400
          "secondary": "#fbbf24", // namibian-gold-400
          "accent": "#8fbc8f", // savanna-green
          "neutral": "#94a3b8", // slate-400
          "base-100": "#0f172a", // slate-900
          "base-200": "#1e293b", // slate-800
          "base-300": "#334155", // slate-700
          "info": "#60a5fa", // brand-blue-400
          "success": "#10b981",
          "warning": "#fbbf24", // namibian-gold-400
          "error": "#ef4444",
        },
      },
    ],
  },
}

export default config

