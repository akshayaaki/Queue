/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        // Coolors Palette 000000-14213d-fca311-e5e5e5-ffffff
        brand: {
          black: "#000000",
          navy: "#14213d",
          navyDark: "#0d1629",
          navyLight: "#1c2d52",
          gold: "#fca311",
          goldHover: "#e5920b",
          goldLight: "#fef3c7",
          platinum: "#e5e5e5",
          platinumLight: "#f4f4f5",
          white: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
        "badge-ping": {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "badge-ping": "badge-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(20, 33, 61, 0.07), 0 1px 2px -1px rgba(20, 33, 61, 0.04)",
        "card-hover": "0 4px 12px 0 rgba(20, 33, 61, 0.1), 0 2px 4px -2px rgba(20, 33, 61, 0.06)",
        dropdown: "0 10px 25px -5px rgba(20, 33, 61, 0.12), 0 8px 10px -6px rgba(20, 33, 61, 0.08)",
        gold: "0 4px 14px 0 rgba(252, 163, 17, 0.35)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
