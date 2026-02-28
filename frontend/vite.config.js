import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [
      react(),
      tailwindcss(),

      // Enable PWA ONLY in production
      isProduction &&
      VitePWA({
        registerType: "autoUpdate",

        includeAssets: ["favicon.ico"],

        manifest: {
          name: "College Management System",
          short_name: "CMS",
          description: "College Management System",
          theme_color: "#111827",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/pwa-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },

        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,

          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                  request.destination === "style" ||
                  request.destination === "script",
              handler: "CacheFirst",
              options: {
                cacheName: "static-assets",
              },
            },
            {
              urlPattern: ({ request }) =>
                  request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "images",
              },
            },
            {
              urlPattern: ({ url }) =>
                  url.pathname.startsWith("/api/"),
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
                networkTimeoutSeconds: 3,
              },
            },
          ],
        },
      }),
    ].filter(Boolean),

    server: {
      host: true,
      port: 5173,
      strictPort: true,
    },
  };
});