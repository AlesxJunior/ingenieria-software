/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') && !id.includes('react-router')) return 'react';
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('styled-components')) return 'styled';
            if (id.includes('axios')) return 'axios';
            if (id.includes('@fortawesome')) return 'icons';
            if (id.includes('vitest') || id.includes('@testing-library')) return 'test-utils';
            return 'vendor';
          }
          if (id.includes('/Inventario/')) return 'inventario';
          if (id.includes('/components/') && !id.includes('/Inventario/')) return 'components';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**',
    ],
  },
});
