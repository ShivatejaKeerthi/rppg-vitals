export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        heartbeat: "heartbeat var(--beat-duration, 1s) ease-in-out infinite",
      },
      keyframes: {
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%":       { transform: "scale(1.25)" },
          "28%":       { transform: "scale(1)" },
          "42%":       { transform: "scale(1.15)" },
          "70%":       { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
