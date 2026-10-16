export default {
  lead: 'ダイアログの名前と説明。名前は h2 の内側の span へ、説明は aria-describedby へ、自動で配線される。省略は CSS だけで行い、名前は欠けない。',
  clamp: {
    title: '長いタイトル',
    intro: '既定は 2 行で省略。溢れているときだけ「全文を表示」のトグルが出る。',
    exampleTitle: '長いタイトルの省略',
    exampleDescription: '省略されていても、スクリーンリーダーには全文が読まれる。',
  },
  why: {
    title: 'なぜ CSS だけで省略するのか',
    body: [
      '文字列を JS で切ると、DOM のテキストそのものが欠ける。`aria-labelledby` が指す名前も一緒に欠け、スクリーンリーダーの利用者は「第3四半期 東北エリア 店舗別売…」というダイアログに入ることになる。`line-clamp` は見た目だけを切るので、名前は常に完全なまま残る。',
    ],
    mockLong: '第3四半期 東北エリア 店舗別売上レポートの共有設定を変更する',
    mockToggle: '全文を表示',
    mockCut: '第3四半期 東北エリア 店舗別売…',
    mockTooltip: '長押しで全文',
    do: '押して開く明示的なボタンで全文を見せる。`aria-expanded` と `aria-controls` を持つ（T-08）。',
    dont: 'hover・`title` 属性・長押しに頼らない。タッチで出ず、OS のコンテキストメニューとも衝突する（T-05 / T-06）。',
  },
  a11yCaption: 'タイトルと説明が満たす仕様',
};
