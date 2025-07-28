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
        background: "#0a0a0a",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#00ff88",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#00ff88",
          foreground: "#000000",
        },
        warning: {
          DEFAULT: "#ffaa00",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#333333",
          foreground: "#888888",
        },
        accent: {
          DEFAULT: "#00ff88",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#111111",
          foreground: "#ffffff",
        },
        chart: {
          "1": "#00ff88",
          "2": "#0088ff",
          "3": "#ff0088",
          "4": "#ffaa00",
          "5": "#aa00ff",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;