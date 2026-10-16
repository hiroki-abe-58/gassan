import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    // サイトの文言（site/i18n）は、デモと同じくパッケージ名で gassan を読む。ビルド前でも src を見る。
    alias: [{ find: /^@genelab\/gassan$/, replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)) }],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: false,
    css: false,
    restoreMocks: true,
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
