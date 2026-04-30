import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
        // Nexora custom colors
        electric: {
          DEFAULT: "hsl(var(--electric-blue))",
          50: "hsl(187 100% 95%)",
          100: "hsl(187 100% 85%)",
          200: "hsl(187 100% 75%)",
          300: "hsl(187 100% 65%)",
          400: "hsl(187 100% 55%)",
          500: "hsl(187 100% 50%)",
          600: "hsl(187 100% 42%)",
          700: "hsl(187 100% 35%)",
          800: "hsl(187 100% 25%)",
          900: "hsl(187 100% 15%)",
        },
        neon: {
          magenta: "hsl(var(--neon-magenta))",
          purple: "#7A5CFF", // Updated per master prompt
          green: "#00FF9D", // Updated per master prompt
          blue: "#00F0FF", // Electric Blue
          pink: "#FF2ED1", // Cyber Pink
          gold: "#FFD700", // Warning/Gold
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-border": {
          "0%, 100%": { borderColor: "hsl(var(--electric-blue) / 0.3)" },
          "50%": { borderColor: "hsl(var(--electric-blue) / 0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-x": "gradient-x 3s ease infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-border": "pulse-border 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern": "radial-gradient(ellipse at center top, hsl(var(--electric-blue) / 0.15) 0%, transparent 50%)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        ".scrollbar-thin": {
          "&::-webkit-scrollbar": {
            width: "4px",
            height: "4px",
          },
        },
        ".scrollbar-hidden": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-neon": {
          "&::-webkit-scrollbar-thumb": {
            "background-color": "rgba(6, 182, 212, 0.5)",
            "border-radius": "10px",
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;
