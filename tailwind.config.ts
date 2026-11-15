import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5b8fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#1e1b4b",
          800: "#1a1740",
          900: "#0f0d2a",
          950: "#080618",
        },
        brand: {
          purple: "#7c3aed",
          blue: "#2563eb",
          "light-purple": "#a78bfa",
          "light-blue": "#60a5fa",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
        english: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideInRight: { "0%": { transform: "translateX(20px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
