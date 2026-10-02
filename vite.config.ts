import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/**
 * デモ専用の設定。ライブラリのビルドは tsup が担当する。
 * src を alias で直接見ているので、ビルドせずに HMR が効く。
 */
export default defineConfig({
  root: 'examples/react',
  plugins: [react()],
  resolve: {
    alias: {
      '@genelab/kasane': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      'kasane/styles.css': fileURLToPath(new URL('./src/styles.css', import.meta.url)),
    },
  },
  server: { port: 5173 },
});
