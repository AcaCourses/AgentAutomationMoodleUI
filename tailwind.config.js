/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        moodle: {
          orange: "#F26A36",
          orangeHover: "#D95220",
          lightOrange: "#FFF4EF",
          navy: "#1B2A4A",
          darkNavy: "#0F1A30",
          slate: "#2D3748",
          lightBg: "#F8FAFC",
          cardBg: "#FFFFFF",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
