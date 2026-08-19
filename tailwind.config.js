/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17140F",
        paper: "#EAE3D3",
        off: "#F7F4EC",
        olive: "#4B4B37",
        brick: "#9A2E1F",
        stone: "#B9A889",
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
