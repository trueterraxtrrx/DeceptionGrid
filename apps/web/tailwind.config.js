/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0c10",
        surface: "#111318",
        border: "#1e2130",
        accent: "#00e5ff",
        "accent-dim": "#0097a7",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
// Project version: DeceptionGrid V1.6




