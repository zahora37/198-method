import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: "var(--accent-soft)",
          100: "color-mix(in srgb, var(--accent) 18%, white)",
          200: "color-mix(in srgb, var(--accent) 30%, white)",
          300: "color-mix(in srgb, var(--accent) 48%, white)",
          400: "color-mix(in srgb, var(--accent) 75%, white)",
          500: "var(--accent)",
          600: "var(--accent)",
          700: "color-mix(in srgb, var(--accent) 80%, black)",
          800: "color-mix(in srgb, var(--accent) 65%, black)",
          900: "color-mix(in srgb, var(--accent) 50%, black)",
          950: "color-mix(in srgb, var(--accent) 35%, black)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
