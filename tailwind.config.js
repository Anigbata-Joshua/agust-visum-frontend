/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        off: "rgb(var(--off) / <alpha-value>)",
        olive: "rgb(var(--olive) / <alpha-value>)",
        brick: "rgb(var(--brick) / <alpha-value>)",
        stone: "rgb(var(--stone) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        cond: ["var(--font-cond)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(22px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .85s cubic-bezier(.2,.8,.2,1) forwards",
      },
    },
  },
  plugins: [],
};
