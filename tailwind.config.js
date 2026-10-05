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
        "sidebar-label": "var(--sidebar-label, var(--muted-fg))",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-fg)",
        },
        "primary-fg": "var(--primary-fg)",
        "primary-foreground": "var(--primary-fg)",
        "on-primary": "var(--primary-fg)",

        /* Semantic indicators V1 */
        "up-bg": "var(--up-bg)",
        "up-fg": "var(--up-fg)",
        "down-bg": "var(--down-bg)",
        "down-fg": "var(--down-fg)",
        "warn-bg": "var(--warn-bg)",
        "warn-fg": "var(--warn-fg)",
        "approve-bg": "var(--approve-bg)",
        "approve-fg": "var(--approve-fg)",

        /* Semantic indicators V2 */
        success: {
          DEFAULT: "var(--approve-fg, #10b981)",
          foreground: "#ffffff",
          bg: "var(--approve-bg, rgba(16, 185, 129, 0.1))",
        },
        warning: {
          DEFAULT: "var(--warn-fg, #f59e0b)",
          foreground: "#ffffff",
          bg: "var(--warn-bg, rgba(245, 158, 11, 0.1))",
        },

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
          DEFAULT: "var(--destructive, #ef4444)",
          foreground: "var(--destructive-fg, #ffffff)",
        },
        input: "var(--border)",
        ring: "var(--primary)",
      },
      boxShadow: {
        "2xs": "0 1px 2px rgba(0, 0, 0, 0.05)",
        xs: "0 1px 3px rgba(0, 0, 0, 0.08)",
        panel: "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md: ["14px", { lineHeight: "20px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "26px" }],
        "2xl": ["20px", { lineHeight: "28px" }],
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
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-to-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-bottom": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
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
        "slide-in-from-right":
          "slide-in-from-right 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-out-to-right":
          "slide-out-to-right 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-from-bottom":
          "slide-in-from-bottom 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-out-to-bottom":
          "slide-out-to-bottom 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
