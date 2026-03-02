import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // dynamic colour classes used in FeedbackPanel & home features
    { pattern: /bg-(emerald|sky|purple|amber|red)-(50|100|600)/ },
    { pattern: /text-(emerald|sky|purple|amber|red)-(600|700|800)/ },
    { pattern: /border-(emerald|sky|purple|amber|red)-200/ },
  ],
  theme: {
    extend: {
      colors: {
        tajweed: {
          qalqalah: "#4ade80",
          ghunna: "#fbbf24",
          madd: "#60a5fa",
          idgham: "#a78bfa",
          ikhfa: "#fb923c",
        },
      },
      fontFamily: {
        arabic: ['"Amiri Quran"', '"Noto Naskh Arabic"', "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
