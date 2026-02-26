import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    //basicSsl(),

    VitePWA({
      registerType: "autoUpdate",

      devOptions: {
        enabled: true,
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
                request.destination === "style" ||
                request.destination === "script",
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: ({ request }) =>
                request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: ({ url }) =>
                url.port === "5000" &&
                url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5,
              },
            },
          },
        ],
      },

      manifest: {
        name: "College Management System",
        short_name: "CMS",
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

        screenshots: [
          {
            src: "/screenshot-mobile.png",
            sizes: "390x844",
            type: "image/png",
          },
          {
            src: "/screenshot-desktop.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide",
          },
        ],
      },
    }),
  ],

  server: {
    host: "0.0.0.0",
    //https: true,
    allowedHosts: ["de1f-2409-40e2-101c-5-3086-80af-e1c3-3f49.ngrok-free.app"],
  },
});