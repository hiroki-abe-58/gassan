export default {
  lead: '「テストが緑である」ことと「保証されている」ことは別物である。何をどの層で検証し、何をまだ検証できていないかを分けて書く。',
  stats: {
    tests: (files: number): string => `テスト（${String(files)} ファイル）`,
    items: '振る舞いの項目',
    proven: 'テストで証明済みの項目',
    device: '実機でしか確かめられない項目',
  },
  pipeline: {
    intro: '上から順に走り、1 つでも落ちたら止まる。下の段ほど、上の段では原理的に見つからない事故を捕まえる。',
    /** command はコマンド名なので訳さない。 */
    steps: [
      { command: 'tsc --noEmit', catches: '型の食い違い' },
      { command: 'eslint .', catches: '静的に分かる書き間違い' },
      { command: 'vitest run', catches: 'アクセシブルネーム、ゲートの論理和、閉じる理由の分類、色のコントラスト比' },
      { command: 'check:trace', catches: '仕様の項目と根拠の欠落・余剰、存在しないテスト名の引用、文書に書いた件数のずれ' },
      { command: 'check:docs', catches: 'README と docs のコード例が、公開 API でコンパイルできないこと' },
      { command: 'tsup', catches: 'ESM / CJS / 型の生成の失敗' },
      { command: 'check:dist', catches: '"use client" の消失、公開 API の欠落、サイズ予算の超過' },
      {
        command: 'check:ssr',
        catches: 'レンダー中の window 参照（Next.js App Router で落ちる）、SSR 時点のゲートの fail-open',
      },
      {
        command: 'check:pack',
        catches: 'npm に載る形の事故（LICENSE 欠落、types 条件の取り違え、同梱文書のリンク切れ）',
      },
    ],
  },
  status: {
    title: '項目の状態',
    intro: (count: number): string => `${String(count)} 項目それぞれが、どの強さで保証されているか。`,
    count: (n: number): string => `${String(n)} 項目`,
    weakMust: (n: number): string =>
      `必須（M）なのに「記述」の項目が ${String(n)} 件ある。値は機械検証しているが、描画結果は実ブラウザでしか確かめられない。これがこのライブラリの現在の弱点で、隠さずに出す。`,
  },
  device: {
    title: 'jsdom では検証できないもの',
    intro:
      'top layer・退出アニメ・スクリムの濃さのように、描画しないと真偽が決まらない項目。examples/css-check.html を実機で開くと、同じ項目がチェックボックスになっている。',
    tableCaption: '実機の検品票',
    columns: { id: 'ID', item: '項目', how: '確認方法', diagnosis: '落ちていたら' },
    pending: (n: number): string =>
      `この ${String(n)} 項目は、まだ実機で消化していない（ROADMAP v0.2.0）。実ブラウザでの自動検査（Playwright + axe）は v0.4.0 で入れる。詳しくは [VERIFICATION.md](VERIFICATION.md) と [ROADMAP.md](ROADMAP.md)。`,
  },
};
