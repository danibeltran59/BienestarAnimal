import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // Cambiamos 'auto' por 'script' para evitar el error de "virtual module"
            injectRegister: 'script',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
                cleanupOutdatedCaches: true,
                // Evitamos que el PWA intercepte rutas de API
                navigateFallbackDenylist: [/^\/api/],
            },
            manifest: {
                name: 'Bienestar Animal - Sistema de Gestión',
                short_name: 'BienestarAnimal',
                description: 'Sistema profesional para la gestión del bienestar animal',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
            },
        }),
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
        outDir: 'dist', // Aseguramos que Vercel encuentre la carpeta
        emptyOutDir: true,
    },
});
