import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/renovatio/',
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        name: 'Renovatio — pequenos gestos / small steps',
        short_name: 'Renovatio',
        description:
          'Pequenos gestos para reacender o prazer. Small steps to feel again. Micro-tarefas com horário, três bons gestos por dia e um registro do que foi minimamente bom.',
        lang: 'en',
        dir: 'ltr',
        id: './',
        start_url: './#/hoje',
        scope: './',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#f6f1e8',
        theme_color: '#201b17',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Nova micro-tarefa / New micro-task',
            short_name: 'Nova tarefa / New task',
            url: './#/rotina?novo=1',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Registrar um bom gesto / Record a good gesture',
            short_name: 'Bom gesto / Good gesture',
            url: './#/gestos?novo=1',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        globIgnores: ['og.png'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: true,
  },
})
