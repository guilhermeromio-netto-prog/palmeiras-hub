import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/palmeiras-hub/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'palmeiras-crest.svg',
        'apple-touch-icon.png',
        'pwa-192.png',
        'pwa-512.png',
        'pwa-maskable-512.png',
        'brand/bg-pitch.png',
        'brand/hero-campeao.png',
        'brand/btn-ball.png',
        'brand/btn-trophy.png',
        'brand/btn-shield.png',
        'brand/btn-calendar.png',
        'brand/btn-torcida.png',
        '.nojekyll',
      ],
      manifest: {
        name: 'Palmeiras Hub',
        short_name: 'Palmeiras Hub',
        description:
          'Hub pessoal de torcedor do Palmeiras — jogos, tabela, elenco e notícias.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/palmeiras-hub/',
        scope: '/palmeiras-hub/',
        id: '/palmeiras-hub/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#004d2c',
        theme_color: '#006437',
        categories: ['sports', 'entertainment'],
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        cacheId: 'palmeiras-hub-v400',
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2}'],
        navigateFallback: '/palmeiras-hub/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              /espn\.com|espncdn\.com|thesportsdb\.com|wikipedia\.org|rss2json\.com|instantdb\.com/i.test(
                url.hostname
              ),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'palmeiras-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 48, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
