/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bg:       "hsl(var(--bg))",
        surface:  "hsl(var(--surface))",
        surface2: "hsl(var(--surface-2))",
        border:   "hsl(var(--border))",
        text:     "hsl(var(--text))",
        muted:    "hsl(var(--text-muted))",
        accent:   "hsl(var(--accent))",
        accent2:  "hsl(var(--accent-2))",
        accent3:  "hsl(var(--accent-3))",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow:   "0 0 40px rgba(168,85,247,0.3)",
        "glow-lg": "0 0 80px rgba(168,85,247,0.4)",
        card:   "0 24px 60px rgba(0,0,0,0.4)",
        "card-lg": "0 40px 100px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-purple": "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
        "glow-pink":   "radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)",
        "glow-cyan":   "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
