/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // New dark theme palette
        "bg-primary": "#0a0a0f",
        "bg-secondary": "#12121a",
        "bg-elevated": "#1a1a28",
        gold: {
          DEFAULT: "#c8a951",
          light: "#e8d48b",
          dark: "#a08030",
        },
        // Legacy brand colors preserved
        brand: {
          50:  "#fef7ee",
          100: "#fdedd7",
          200: "#fad7ae",
          300: "#f6ba7a",
          400: "#f19344",
          500: "#ed7220",
          600: "#de5a15",
          700: "#b84313",
          800: "#923617",
          900: "#762f15",
          950: "#401508",
        },
        charcoal: {
          800: "#1e2328",
          900: "#14181c",
          950: "#0c0f12",
        },
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        // Legacy
        inter: ["Inter", "ui-sans-serif", "system-ui"],
        playfair: ["Playfair Display", "Georgia", "serif"],
      },
      backdropBlur: {
        "glass": "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
