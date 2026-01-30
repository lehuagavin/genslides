/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // MotherDuck color palette
        cream: "var(--md-cream)",
        sunbeam: "var(--md-sunbeam)",
        "sunbeam-dark": "var(--md-sunbeam-dark)",
        sky: "var(--md-sky)",
        "sky-strong": "var(--md-sky-strong)",
        "soft-blue": "var(--md-soft-blue)",
        cloud: "var(--md-cloud)",
        fog: "var(--md-fog)",
        ink: "var(--md-ink)",
        slate: "var(--md-slate)",
        graphite: "var(--md-graphite)",
        watermelon: "var(--md-watermelon)",
      },
      fontFamily: {
        primary: ["var(--font-family-primary)"],
        alt: ["var(--font-family-alt)"],
      },
      borderRadius: {
        micro: "var(--radius-micro)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
