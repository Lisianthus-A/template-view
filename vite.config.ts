import { defineConfig } from "vite";
// import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";
import path from "node:path";
import process from "node:process";

const isDev = process.env.NODE_ENV === "development";

// https://vitejs.dev/config/
export default defineConfig({
  // visualizer()
  plugins: [react()],
  esbuild: {
    drop: isDev ? undefined : ["console.log", "debugger"],
  },
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
