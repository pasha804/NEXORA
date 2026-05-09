import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    // SPA fallback: serve index.html for all non-asset routes on refresh
    historyApiFallback: true,
    // IMPORTANT: Proxy to localhost:80 where nginx gateway is exposed
    // This works because docker-compose maps nginx:80 to host:80
    proxy: {
      "/auth": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/profile": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/settings": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/media": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/matchmaking": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/ranking": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/search": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/connections": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/messages": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/feed": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/notifications": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/pvp": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/skills": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/projects": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/social": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/users": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/ai": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/dashboard": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
      "/posts": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));