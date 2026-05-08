import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inject the SW registration script automatically
      injectRegister: 'auto',
      // Include extra assets the SW should precache
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],

      manifest: {
        name: 'Band Live Cue Board',
        short_name: 'Cue Board',
        description: 'Real-time live cue board for bands — send section cues to every device on stage.',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['music', 'utilities'],
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Precache everything the build emits (JS, CSS, HTML)
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],

        // Never precache Firebase JS or RTDB traffic
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/firebase/],

        runtimeCaching: [
          // Firebase SDK chunks — cache-first with long TTL so the UI
          // shell loads offline even when the database is unreachable
          {
            urlPattern: /^https:\/\/www\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-sdk',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // Google Fonts (if ever added)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts' },
          },
        ],
      },

      // Dev mode: also register SW during `npm run dev` for testing
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
