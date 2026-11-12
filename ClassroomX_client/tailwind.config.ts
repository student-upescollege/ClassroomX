import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "expand-down": {
          "0%": { opacity: "0", maxHeight: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", maxHeight: "9999px", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in":       "fade-in 0.3s ease-out both",
        "slide-up":      "slide-up 0.35s ease-out both",
        "scale-in":      "scale-in 0.2s ease-out both",
        "slide-in-right":"slide-in-right 0.3s ease-out both",
        "expand-down":   "expand-down 0.3s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
