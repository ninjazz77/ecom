/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
      },
      colors: {
        background: "hsl(var(--background))",
        "background-alt": "hsl(var(--background-alt))",
        surface: "hsl(var(--surface))",
        "surface-soft": "hsl(var(--surface-soft))",
        "surface-strong": "hsl(var(--surface-strong))",
        panel: "hsl(var(--panel))",
        "panel-soft": "hsl(var(--panel-soft))",
        text: "hsl(var(--text))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
        },
      },
      boxShadow: {
        glow: "0 20px 60px rgba(56,189,248,0.18)",
        float: "0 30px 80px rgba(56,189,248,0.16)",
      },
    },
  },
};
