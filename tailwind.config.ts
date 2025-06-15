
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#fff', // Fundo branco
        foreground: '#1A1A1A', // Texto principal escuro
        primary: {
          DEFAULT: '#B91C1C', // Vermelho forte
          foreground: '#fff'
        },
        secondary: {
          DEFAULT: '#F3F4F6', // Cinza claro
          foreground: '#1A1A1A'
        },
        destructive: {
          DEFAULT: '#B91C1C',
          foreground: '#fff'
        },
        muted: {
          DEFAULT: '#E5E7EB',
          foreground: '#4B5563'
        },
        accent: {
          DEFAULT: '#E5E7EB',
          foreground: '#B91C1C'
        },
        popover: {
          DEFAULT: '#fff',
          foreground: '#1A1A1A'
        },
        card: {
          DEFAULT: '#fff',
          foreground: '#1A1A1A'
        },
        sidebar: {
          DEFAULT: '#fff',
          foreground: '#1A1A1A',
          primary: '#B91C1C',
          'primary-foreground': '#fff',
          accent: '#F3F4F6',
          'accent-foreground': '#B91C1C',
          border: '#E5E7EB',
          ring: '#B91C1C'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

