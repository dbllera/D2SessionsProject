import { defineConfig } from 'vite';

// The Duke world is served on 5174 in dev and built into ../dist/duke next to the DKU library.
export default defineConfig(({ command }) => ({
  base: './',
  define: {
    __D2_WORLD_URLS__: JSON.stringify(
      command === 'serve'
        ? { dku: 'http://127.0.0.1:5173/', duke: 'http://127.0.0.1:5174/' }
        : { dku: '../', duke: './' },
    ),
  },
  server: { host: '127.0.0.1', port: 5174, strictPort: true, fs: { allow: ['..'] } },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
}));
