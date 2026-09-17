import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light
        canvas: "#F7F7F5",
        surface: "#FFFFFF",
        ink: "#0B0B0D",
        muted: "#6B6B73",
        line: "#E7E7E4",
        // Dark section
        night: "#0B0B0D",
        "night-surface": "#151518",
        "night-line": "#29292E",
        "night-muted": "#9999A2",
        // AI accents
        accent: "#635BFF",
        "accent-hover": "#5148E5",
        "accent-soft": "#8B7CFF",
        // Semantic
        success: "#22A06B",
        warning: "#E6A700",
        error: "#E5484D",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["clamp(2.75rem, 6vw, 4.75rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "hero": ["clamp(2.25rem, 5vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
      },
      spacing: {
        "4.5": "1.125rem",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,11,13,0.04), 0 8px 24px rgba(11,11,13,0.05)",
        float: "0 12px 40px rgba(11,11,13,0.10), 0 2px 8px rgba(11,11,13,0.06)",
        glow: "0 0 0 1px rgba(99,91,255,0.18), 0 8px 30px rgba(99,91,255,0.16)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.5s ease both",
        "scale-in": "scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "blink": "blink 1s step-end infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
