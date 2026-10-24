export default {
  lead: '幅はトークンで、高さは CSS Grid と dvh で決める。JS で高さを計算しない。スクロールするのは本文だけ。',
  size: {
    title: '幅のトークン',
    intro: 'パネルの幅は min(100%, トークン)。狭い画面ではみ出さず、広い画面では読みやすい行長に収まる。',
  },
  placement: {
    title: '配置',
    intro: 'placement="auto" は JS で center か sheet に解決してから DOM に流す。start と end は横の端から出る面で、用途で選ぶ（auto はこれに解決しない）。',
    mockTitle: '経路',
    /** 配置ごとの使いどころ。キーは placement の値。 */
    when: {
      center: 'デスクトップの既定',
      top: '内容の高さが大きく変わるとき。中央寄せだと高さの変化で上下に暴れる',
      sheet: '幅 600px 未満の既定。片手で届く場所に primary を置ける',
      start: 'ナビゲーションの引き出し。狭い画面でアプリの案内を開く',
      end: '詳細や絞り込みの面。一覧を見ながら中身を確かめる',
    },
  },
  grid: {
    title: 'パネルの格子',
    intro: 'ヘッダ・本文・フッタの 3 行。本文の行が minmax(0, 1fr) でないと、本文が縮まずスクロールしない。',
    code: '.g-panel {\n  inline-size: min(100%, var(--g-panel-max));\n  max-block-size: 100%;           /* 100vh は使わない */\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n}\n.g-header { grid-row: 1; }\n.g-body   { grid-row: 2; overflow: auto; overscroll-behavior: contain; }\n.g-footer { grid-row: 3; }',
    codeCaption: '考え方（実際の規則は src/styles.css）',
    mockTitle: '更新履歴',
    mockClose: '閉じる',
    do: 'スクロールするのは本文だけ。ヘッダとフッタは常に見えている（B-01 / H-10）。',
    mockCut: 'タイトルが画面の上に切れている',
    dont: '`max-h-[90vh]` や `1fr` 単体で済ませない。モバイルのアドレスバーで高さが破綻し、中央寄せで上端が切れる。',
  },
  touch: {
    title: '触れる大きさ',
    /** tap は --g-tap の値。 */
    body: (tap: string): string =>
      `ボタンとアイコンボタンの的は \`${tap}\`。WCAG 2.5.8 の最低は 24px だが、Apple HIG の 44px を採る。「戻る」と「×」のあいだは 8px 以上空ける。この 2 つの押し間違いが、いちばん高くつく事故だからである（H-03 / H-04）。`,
    callout: 'セーフエリアは必ず `max()` で包む。`env(safe-area-inset-bottom)` が 0 の端末で余白が消えないように（C-04 / F-12）。',
  },
  spec: {
    title: 'コンテナの項目',
    tableCaption: 'コンテナの仕様',
  },
};
