export default {
  lead: 'すべての色はカスタムプロパティで、ライトとダークの 2 組を持つ。どの組が何の文字を載せるかを決め、その比をテストで計算している。',
  tokens: {
    title: '色のトークン',
    intro: 'src/styles.css の @layer gassan.tokens から読んでいる。ダーク欄が空のものは、ライトの値をそのまま使う。',
    tableCaption: '色のトークン',
    token: 'トークン',
    light: 'ライト',
    dark: 'ダーク',
  },
  contrast: {
    title: 'コントラスト比',
    intro: '下の表はこのページを開いた時点のトークンから計算している。同じ組と同じ計算を tests/tokens.test.ts が使い、基準を割ると CI が落ちる。',
    tableCaption: { light: 'ライトのコントラスト比', dark: 'ダークのコントラスト比' },
    sample: '見本',
    pair: '組',
    use: '用途',
    ratio: '比',
    min: '基準',
    /** 組の用途。キーは site/data/color.ts の CONTRAST_PAIRS の前景（--g- を除いたトークン名）。 */
    uses: {
      fg: '本文',
      'fg-muted': '補足・tertiary・ゲート中の secondary',
      'on-accent': 'primary',
      'on-accent-muted': 'ゲート中の primary（G-10）',
      'on-danger': 'danger ボタン（F-06）',
      danger: 'エラー文・必須の印',
      sunday: 'カレンダーの日曜と祝日（I-16）',
      saturday: 'カレンダーの土曜（I-16）',
      focus: 'フォーカスリング（K-07。非テキストは 3:1）',
    },
    pass: (min: number): string => `合格（${String(min)}:1 以上）`,
    fail: (min: number): string => `不足（${String(min)}:1 未満）`,
    callout:
      'ゲート中の primary（`--g-accent-muted`）は、かつて白文字で 3.16:1 しかなかった。コメントには「4.5:1 を維持する」と書いてあり、追跡表でも「値は検査済み」と主張していたが、比そのものは誰も計算していなかった。このページで比を表示しようとして見つかった。',
  },
  gated: {
    title: '押せないボタンこそ、読めなければならない',
    body: [
      '`disabled` の要素は WCAG のコントラスト要件から除外される。だが gassan のゲート中のボタンは `aria-disabled` で、フォーカスでき、押せば理由を返す「使える」ボタンである。除外規定には頼れない。だから専用のトークンで 4.5:1 を保ち、`opacity` で薄くして済ませることはしない（G-10）。',
      '背景用のトークンを文字色に流用しないことも決めている。ダークでは、明るい文字を載せる背景と、暗い面に載る文字の両方で 4.5:1 を取れる色は存在しない。',
    ],
  },
  theme: {
    title: '自分の色にする',
    intro: 'トークンは @layer gassan.tokens の中にあるので、レイヤの外から書けば詳細度を気にせず上書きできる。',
    code: ':root {\n  --g-accent: #0b5cad;\n  --g-on-accent: #ffffff;\n  --g-accent-muted: #5f7184; /* 白文字で 4.5:1 以上を確かめてから */\n  --g-radius: 20px;\n}',
  },
};
