import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '992px',
        'xl': '1200px',
        '2xl': '1300px',
        '3xl': '1600px',
        '4xl': '1800px',
        '5xl': '1920px',
      },
      colors: {
        // Lime green color system (inspired by every-day.nl)
        lime: {
          50: 'rgb(245, 252, 207)',
          100: 'rgb(240, 251, 189)',
          200: 'rgb(235, 250, 171)',
          300: 'rgb(230, 249, 153)',
          400: 'rgb(225, 248, 135)',
          500: 'rgb(215, 247, 91)',  // Primary lime (#D7F75B)
          600: 'rgb(202, 232, 85)',  // Dark lime
          700: 'rgb(180, 207, 76)',
          800: 'rgb(158, 182, 67)',
          900: 'rgb(136, 157, 58)',
          950: 'rgb(114, 132, 49)',
        },
        // Monochrome blacks and whites
        mono: {
          black: 'rgb(0, 0, 0)',
          'gray-900': 'rgb(17, 17, 17)',
          'gray-800': 'rgb(34, 34, 34)',
          'gray-700': 'rgb(51, 51, 51)',
          'gray-600': 'rgb(68, 68, 68)',
          'gray-500': 'rgb(128, 128, 128)',
          'gray-400': 'rgb(170, 170, 170)',
          'gray-300': 'rgb(204, 204, 204)',
          'gray-200': 'rgb(229, 229, 229)',
          'gray-100': 'rgb(242, 242, 242)',
          white: 'rgb(255, 255, 255)',
        },
        // Keep existing Radix UI color system for compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        wave: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        spinBorder: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        wave: "wave 3s ease-out infinite",
        spinBorder: "spinBorder 6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
