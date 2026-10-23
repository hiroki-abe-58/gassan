import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const CLIENT_DIRECTIVE = '"use client";';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm', 'cjs'],
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // banner: { js: '"use client";' } は使えない。
  // rollup が「モジュールレベルディレクティブはバンドル時に壊れる」と判断して捨てるため、
  // 出力に残らない。App Router から import した瞬間にサーバーコンポーネント扱いになり、
  // useState を使っている、という実行時エラーになる。
  onSuccess: async () => {
    // CSS はそれぞれ2つ出す（部品の styles と、ページのテンプレートの templates）。
    //   <name>.css        … 配布用。コメントを落として gzip を稼ぐ
    //   <name>.source.css … 原文。なぜこの値なのかが書いてあるので、読む人向けに残す
    for (const name of ['styles', 'templates']) {
      const source = readFileSync(`src/${name}.css`, 'utf8');
      writeFileSync(`dist/${name}.source.css`, source);
      const stripped = source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
      writeFileSync(`dist/${name}.css`, `${stripped}\n`);
    }

    for (const file of ['dist/index.js', 'dist/index.cjs']) {
      const content = readFileSync(file, 'utf8');
      if (content.startsWith(CLIENT_DIRECTIVE)) continue;
      // 改行を入れずに連結する。行番号が動かないので sourcemap がずれない。
      writeFileSync(file, `${CLIENT_DIRECTIVE}${content}`);
    }
  },
});
