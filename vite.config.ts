import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxy to our secure backend server (credentials never leave the server)
      "/api/proxy": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      // Fallback: direct CORS bypass for MapBiomas GraphQL (used only if proxy server is down)
      "/api/mapbiomas": {
        target: "https://plataforma.alerta.mapbiomas.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mapbiomas/, "/api/v2/graphql"),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
