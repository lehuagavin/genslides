import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: true,
      },
      "/static": {
        target: "http://localhost:3003",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:3003",
        ws: true,
        // Suppress proxy errors in console (connection resets are expected during reconnects)
        configure: (proxy) => {
          proxy.on("error", () => {
            // Silently ignore proxy errors - WebSocket client will reconnect
          });
        },
      },
    },
  },
});
