import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const systemId = process.env.VITE_SYSTEM_ID ?? 'cfb'
let systemManifest = { name: 'Army Builder', shortName: 'AB', description: 'Tabletop army builder', branding: {} }
try {
  systemManifest = JSON.parse(readFileSync(resolve(__dirname, 'systems', systemId, 'system.json'), 'utf-8'))
} catch { /* file missing — use defaults */ }

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: systemManifest.branding?.appName ?? systemManifest.name,
        short_name: systemManifest.shortName ?? systemManifest.name,
        description: systemManifest.description ?? 'Tabletop army builder',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache' },
          },
        ],
      },
    }),
  ],
})
