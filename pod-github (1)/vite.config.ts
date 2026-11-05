import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifestFilename: 'manifest.json',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'offline.html',
          'manifest.json',
          'screenshots/desktop-1280x720.png',
          'screenshots/mobile-750x1334.png',
        ],
        manifest: {
          id: './',
          name: 'Raport Odbioru Lokalu',
          short_name: 'Odbiór',
          description: 'Mobilna checklista odbioru technicznego lokalu i mieszkania z generowaniem i wysyłką raportu PDF na e-mail.',
          lang: 'pl',
          dir: 'ltr',
          start_url: './',
          scope: './',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          orientation: 'any',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          categories: ['business', 'productivity', 'utilities'],
          prefer_related_applications: false,
          related_applications: [],
          handle_links: 'preferred',
          launch_handler: {
            client_mode: ['navigate-existing', 'auto'],
          },
          edge_side_panel: {
            preferred_width: 480,
          },
          icons: [
            {
              src: 'pwa-96x96.png',
              sizes: '96x96',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-128x128.png',
              sizes: '128x128',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-256x256.png',
              sizes: '256x256',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-384x384.png',
              sizes: '384x384',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: 'screenshots/desktop-1280x720.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Główny pulpit odbioru technicznego lokalu na komputerze',
            },
            {
              src: 'screenshots/mobile-750x1334.png',
              sizes: '750x1334',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Mobilna checklista z notatkami głosowymi i zdjęciami',
            },
          ],
          shortcuts: [
            {
              name: 'Nowy Odbiór',
              short_name: 'Nowy',
              description: 'Rozpocznij nowy czysty protokół odbioru lokalu',
              url: './?action=new',
              icons: [
                {
                  src: 'pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
              ],
            },
            {
              name: 'Zapisane Protokoły',
              short_name: 'Zapisane',
              description: 'Otwórz listę zapisanych odbiorów technicznych',
              url: './?action=saved',
              icons: [
                {
                  src: 'pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
              ],
            },
            {
              name: 'Eksport PDF & E-mail',
              short_name: 'Eksport',
              description: 'Podgląd i wysyłka raportu PDF na e-mail',
              url: './?action=export',
              icons: [
                {
                  src: 'pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
              ],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
});
