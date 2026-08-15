import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "3xl": "1620px",
      },
      colors: {
        primary: "var(--color-primary-color)",
        secondary: "var(--color-secondary-color)",
        "off-white": "var(--color-off-white-color)",
        black: "var(--color-black-color)",
        charcol: "var(--color-charcol-color)",
        gray: "var(--color-gray-color)",
        "soft-orange": "var(--color-soft-orange-color)",
        "deep-teal": "var(--color-deep-teal-color)",
        "light-slate": "var(--color-light-slate-color)",
        "pastel-yellow": "var(--color-pastel-yellow-color)",
        "teal-green": "var(--color-teal-green-color)",
        "warm-sand": "var(--color-warm-sand-color)",
        "warm-sand-light": "var(--color-warm-sand-light-color)",
        page: "var(--color-off-white-color)",
        cardBorder: "var(--color-slate-border-color)",
        "brand-teal": "var(--color-teal-green-color)",
        "brand-tealDark": "var(--color-dark-teal-green-color)",
      },
      boxShadow: {
        "quiz-card": "var(--shadow-quiz-card)",
      },
    },
  },
  plugins: [],
};

export default config;
