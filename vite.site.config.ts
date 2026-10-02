import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

import { gassanData } from './site/plugins/gassan-data';

/**
 * ドキュメントサイトの設定。ライブラリのビルドは tsup、手元の検証台は vite.config.ts が担当する。
 *
 * base を './' にしているのは、GitHub Pages のサブパス（/gassan/）でも
 * ローカルの preview でも同じ成果物がそのまま動くようにするため。
 * ルーティングはハッシュなので、サーバー側の書き換え設定も要らない。
 */
export default defineConfig({
  root: 'site',
  base: './',
  plugins: [react(), gassanData()],
  resolve: {
    // デモのコードは利用者が写す前提なので、パッケージ名で import させる。
    // 文字列のキーは前方一致になり styles.css まで index.ts に吸われるので、完全一致で書く。
    alias: [
      { find: /^@genelab\/gassan$/, replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
      {
        find: /^@genelab\/gassan\/styles\.css$/,
        replacement: fileURLToPath(new URL('./src/styles.css', import.meta.url)),
      },
    ],
  },
  server: {
    port: 5180,
    // 仕様書・テスト・型定義はリポジトリ直下にある。サイトはそれを読んで表を作る。
    fs: { allow: ['..'] },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // React はページを跨いで変わらないので、別のファイルにしてキャッシュを効かせる。
      output: { manualChunks: { react: ['react', 'react-dom', 'react-dom/client'] } },
    },
  },
});
