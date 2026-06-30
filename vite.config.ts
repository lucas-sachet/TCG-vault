import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function resolveAppUrl(mode: string): string {
  const environmentVariables = loadEnv(mode, process.cwd(), '');
  const configuredAppUrl =
    environmentVariables.VITE_APP_URL || environmentVariables.APP_URL || '';
  return configuredAppUrl.replace(/\/$/, '');
}

export default defineConfig(({mode}) => {
  const appUrl = resolveAppUrl(mode);

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-env-fallback',
        transformIndexHtml(html) {
          return html
            .replace(/%VITE_APP_URL%/g, appUrl)
            .replace(/%VITE_SUPABASE_URL%/g, loadEnv(mode, process.cwd(), '').VITE_SUPABASE_URL || '');
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            motion: ['motion'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
