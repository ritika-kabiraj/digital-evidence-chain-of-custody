/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F293D",
          accent: "#06B6D4", // Cyan
          purple: "#8B5CF6", // Electric purple
          emerald: "#10B981", // Verification green
          rose: "#F43F5E", // Alarm red
          amber: "#F59E0B",
          text: "#F3F4F6",
          muted: "#9CA3AF"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
