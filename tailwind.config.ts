import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        border: "var(--border)",
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-dark": "var(--bg-dark)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-inverse": "var(--text-inverse)",
        "border-dark": "var(--border-dark)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "Cambria", "serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
