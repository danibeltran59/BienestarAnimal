import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: {
                id: '/',
                start_url: '/',
                scope: '/',
                name: 'Bienestar Animal - Sistema de Gestión',
                short_name: 'BienestarAnimal',
                description: 'Sistema profesional para la gestión del bienestar animal',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            devOptions: {
                enabled: true
            },
            workbox: {
                // No interceptar navegación de API
                navigateFallbackDenylist: [/^\/api/],
                skipWaiting: true,
                clientsClaim: true,
                // Solo precachear assets estáticos
                globPatterns: ['**/*.{js,css,ico,png,webmanifest}']
            }
        })
    ],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            }
        }
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true
    }
})
