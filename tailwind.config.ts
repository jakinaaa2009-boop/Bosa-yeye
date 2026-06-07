import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "coffee-dark": "#1A0E0A",
        "coffee-brown": "#3A1717",
        "wine-red": "#5B2428",
        "deep-red": "#7B1E22",
        gold: "#D6A84F",
        "gold-light": "#F7D978",
        cream: "#FFF4D6",
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F7D978 0%, #D6A84F 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(58,23,23,0.95) 0%, rgba(26,14,10,0.98) 50%, rgba(91,36,40,0.9) 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(123,30,34,0.2) 0%, transparent 50%)",
      },
      boxShadow: {
        gold: "0 0 30px rgba(214, 168, 79, 0.25), 0 4px 20px rgba(0,0,0,0.4)",
        "gold-lg": "0 0 50px rgba(214, 168, 79, 0.35), 0 8px 32px rgba(0,0,0,0.5)",
        card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(214,168,79,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
