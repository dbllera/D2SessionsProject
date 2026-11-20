import { defineConfig } from 'vite';

// The DKU library is the entry world: it builds to ../dist, and the Duke world builds to ../dist/duke.
export default defineConfig(({ command }) => ({
  base: './',
  define: {
    __D2_WORLD_URLS__: JSON.stringify(
      command === 'serve'
        ? { dku: 'http://127.0.0.1:5173/', duke: 'http://127.0.0.1:5174/' }
        : { dku: './', duke: './duke/' },
    ),
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: true, fs: { allow: ['..'] } },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
}));
