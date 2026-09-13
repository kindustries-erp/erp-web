import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

const buildVersion =
  process.env.BUILD_VERSION ??
  `${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiBaseUrl =
    process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || "";
  const cleanApiUrl = apiBaseUrl.replace(/\/$/, "");
  const escapedApiUrl = cleanApiUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const apiUrlPattern = new RegExp(`^${escapedApiUrl}/.*`, "i");
  return {
    server: {
      watch: {
        ignored: [
          "**/node_modules/**",
          "**/dist/**",
          "**/.git/**",
          "**/db/**",
          "**/docs/**",
          "**/.vscode/**",
        ],
      },
    },
    optimizeDeps: {
      include: ["pdfjs-dist/build/pdf.worker.min.mjs"],
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (
              id.includes("react-pdf") ||
              id.includes("pdfjs-dist") ||
              id.includes("xlsx") ||
              id.includes("jszip")
            ) {
              return "vendor-docs";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "vendor-chart";
            }
            if (id.includes("i18next") || id.includes("react-i18next")) {
              return "vendor-i18n";
            }
          },
        },
      },
    },
    define: {
      __APP_BUILD_VERSION__: JSON.stringify(buildVersion),
      __APP_ENV__: JSON.stringify(
        env.APP_ENV || process.env.APP_ENV || "development",
      ),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
        manifest: {
          name: "Hệ thống ERP",
          short_name: "ERP",
          description: "Hệ thống ERP",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ["**/*.{js,css,ico,png,svg}"],
          maximumFileSizeToCacheInBytes: 5000000,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api-vinvoice\.viettel\.vn\/.*/i,
              handler: "NetworkOnly",
            },
            {
              urlPattern: /\/portal\/progress/i,
              handler: "NetworkOnly",
            },
            {
              urlPattern: apiUrlPattern,
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
