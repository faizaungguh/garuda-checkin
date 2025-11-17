import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite"; // <--- INI PENTING UTK TAILWIND V4

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    // 1. Plugin Tailwind v4 (Wajib ada di sini)
    tailwindcss(),

    // 2. Plugin PWA
    VitePWA({
      registerType: "autoUpdate",
      // Kita pakai pwa-192x192.png saja yang sudah pasti ada
      includeAssets: ["pwa-192x192.png", "pwa-512x512.png"],

      // Agar PWA jalan saat npm run dev (testing)
      devOptions: {
        enabled: true,
      },

      manifest: {
        name: "Kendalisada Check In",
        short_name: "CheckIn",
        description: "Aplikasi Check-in Peserta Offline",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
