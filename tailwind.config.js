/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-fg": "var(--muted-fg)",
        faint: "var(--faint)",
        primary: "var(--primary)",
        "primary-fg": "var(--primary-fg)",
        "up-bg": "var(--up-bg)",
        "up-fg": "var(--up-fg)",
        "down-bg": "var(--down-bg)",
        "down-fg": "var(--down-fg)",
        "warn-bg": "var(--warn-bg)",
        "warn-fg": "var(--warn-fg)",
        "approve-bg": "var(--approve-bg)",
        "approve-fg": "var(--approve-fg)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "2xs": "10px",
        xs: "11px",
        sm: "12px",
        base: "13px",
      },
    },
  },
  plugins: [],
};
