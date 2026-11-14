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
        palette: {
          sage: "#CCD5AE",
          celery: "#E9EDC9",
          parchment: "#FEFAE0",
          bisque: "#FAEDCD",
          ochre: "#D4A373",
          ochreDark: "#B88554",
          oliveDark: "#586938",
          charcoal: "#1F2421",
        },
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
        bespoke: "0 1px 3px 0 rgba(40, 32, 20, 0.05), 0 10px 25px -5px rgba(40, 32, 20, 0.04)",
        "bespoke-hover": "0 4px 6px -1px rgba(40, 32, 20, 0.07), 0 20px 30px -10px rgba(40, 32, 20, 0.08)",
        card: "0 0 0 1px rgba(212, 163, 115, 0.15), 0 2px 4px rgba(40, 32, 20, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
