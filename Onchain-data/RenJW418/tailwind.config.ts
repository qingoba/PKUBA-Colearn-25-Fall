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
        cyber: {
          black: "#020610",
          dark: "#0A1225",
          card: "#0D1B36",
          border: "rgba(0,245,212,0.18)",
          cyan: "#00F5D4",
          "cyan-dim": "rgba(0,245,212,0.15)",
          red: "#FF3366",
          gold: "#FFD700",
          purple: "#A855F7",
          muted: "#4A6580",
          text: "#C8DDF0",
        },
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "monospace"],
        mono: ["var(--font-share-tech)", "monospace"],
        body: ["var(--font-syne)", "sans-serif"],
      },
      boxShadow: {
        cyan: "0 0 20px rgba(0,245,212,0.25), 0 0 60px rgba(0,245,212,0.08)",
        "cyan-sm": "0 0 8px rgba(0,245,212,0.4)",
        "cyan-lg":
          "0 0 40px rgba(0,245,212,0.35), 0 0 100px rgba(0,245,212,0.12)",
        red: "0 0 20px rgba(255,51,102,0.3)",
        gold: "0 0 20px rgba(255,215,0,0.3)",
        inset:
          "inset 0 0 30px rgba(0,245,212,0.05), 0 0 0 1px rgba(0,245,212,0.15)",
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(0,245,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,0.04) 1px, transparent 1px)",
        "card-gradient":
          "linear-gradient(135deg, rgba(13,27,54,0.95) 0%, rgba(10,18,37,0.95) 100%)",
        "hero-gradient":
          "radial-gradient(ellipse at 20% 50%, rgba(0,245,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 60%)",
        "glow-line":
          "linear-gradient(90deg, transparent, rgba(0,245,212,0.7), transparent)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 3s linear infinite",
        "float-up": "floatUp 0.6s ease-out forwards",
        blink: "blink 1s step-end infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": {
            boxShadow:
              "0 0 8px rgba(0,245,212,0.4), 0 0 16px rgba(0,245,212,0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 20px rgba(0,245,212,0.8), 0 0 40px rgba(0,245,212,0.4)",
          },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        floatUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
