import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    // Source maps are not emitted: they would publish readable application
    // source, including the entitlement logic, to the production CDN.
    sourcemap: false,
    target: 'es2020',

    rollupOptions: {
      output: {
        /*
         * The application previously shipped as one ~884 kB chunk, so a first
         * visit to the public card page downloaded the charting library and the
         * whole authenticated dashboard before rendering anything.
         *
         * Splitting the heavy, rarely-changing vendors lets them cache
         * independently of application deploys.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'vendor-react';
          }

          if (id.includes('/@supabase/')) {
            return 'vendor-supabase';
          }

          if (id.includes('/recharts/')) {
            return 'vendor-charts';
          }

          return undefined;
        },
      },
    },
  },

  server: {
    port: 5173,
    strictPort: false,
  },
});
