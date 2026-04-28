import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // MediaPipe uses top-level await + WASM — skip pre-bundling
    exclude: ["@mediapipe/tasks-vision"],
  },
});
