import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: https://<username>.github.io/<repo-name>/
// Change VITE_BASE env var or this default if your repo name is different
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? (process.env.VITE_BASE || '/timelab-atelier/') : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
}));
