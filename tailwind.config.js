/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* V1 Core Tokens (Giữ nguyên 100%) */
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-fg)",
        },
        "muted-fg": "var(--muted-fg)",
        faint: "var(--faint)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-fg)",
        },
        "primary-fg": "var(--primary-fg)",
        "primary-foreground": "var(--primary-fg)",

        /* Semantic indicators V1 */
        "up-bg": "var(--up-bg)",
        "up-fg": "var(--up-fg)",
        "down-bg": "var(--down-bg)",
        "down-fg": "var(--down-fg)",
        "warn-bg": "var(--warn-bg)",
        "warn-fg": "var(--warn-fg)",
        "approve-bg": "var(--approve-bg)",
        "approve-fg": "var(--approve-fg)",

        /* V2 & Shadcn UI Primitives Compatibility Tokens */
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        secondary: {
          DEFAULT: "var(--muted)",
          foreground: "var(--foreground)",
        },
        accent: {
          DEFAULT: "var(--surface-hover)",
          foreground: "var(--foreground)",
        },
        destructive: {
          DEFAULT: "var(--down-fg, #ef4444)",
          foreground: "#ffffff",
        },
        input: "var(--border)",
        ring: "var(--primary)",
      },
      boxShadow: {
        panel: "0 4px 16px rgba(0, 0, 0, 0.08)",
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
      keyframes: {
        slideDownAndFade: {
          from: { opacity: 0, transform: "translateY(-8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-left-2": {
          from: { transform: "translateX(-8px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-from-right-2": {
          from: { transform: "translateX(8px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        slideDownAndFade: "slideDownAndFade 300ms ease-out forwards",
        "fade-in-0": "fade-in 200ms ease-out forwards",
        "fade-out-0": "fade-out 100ms ease-in forwards",
        "slide-in-from-left-2": "slide-in-from-left-2 200ms ease-out both",
        "slide-in-from-right-2": "slide-in-from-right-2 200ms ease-out both",
        "animate-in": "fade-in 200ms ease-out both",
        "animate-out": "fade-out 100ms ease-in both",
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",
      },
    },
  },
  plugins: [],
};
