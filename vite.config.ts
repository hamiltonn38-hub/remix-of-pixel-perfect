import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "placeholder.svg", "apple-touch-icon.png"],
      manifest: {
        name: "PITS - Territórios Sustentáveis",
        short_name: "PITS",
        description: "Plataforma Integrada de Territórios Sustentáveis (Semiárido)",
        theme_color: "#F2E8DF",
        background_color: "#FAF9F6",
        display: "standalone",
        icons: [
          {
            src: "/placeholder.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/placeholder.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/servicodados\.ibge\.gov\.br\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "ibge-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/apitempo\.inmet\.gov\.br\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "inmet-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 1 dia
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /.*\/api\/proxy\/mapbiomas.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "mapbiomas-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }, // 1 dia
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
