import { defineConfig } from "vite";
// import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  // visualizer()
  plugins: [react()],
  // esbuild: {
  //   drop: ["console", "debugger"],
  // },
  server: {
    port: 4000,
  },
  base: "./",
  resolve: {
    alias: {
      "@": path.join(__dirname, "./src"),
    },
  },
});
