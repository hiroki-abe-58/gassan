export default {
  eyebrow: 'React のモーダルシェル',
  /** 見出しは 2 行。行の間に改行を入れる。 */
  heroTitle: ['層 1 は、', 'ブラウザに任せる。'],
  lead: 'gassan はネイティブの `<dialog>` を土台にした React のモーダルシェル。フォーカストラップも Esc も背景の inert 化も、一行も実装していない。その代わり、既存のライブラリがほとんど手を付けてこなかった層——情報構造、活性化ゲート、閉じる理由——に全部を注ぐ。',
  start: 'はじめる',
  philosophy: '設計思想を読む',
  stats: {
    items: '列挙した振る舞い',
    tests: '自動テスト',
    proven: 'テストで証明済みの振る舞い',
    trap: '自前のフォーカストラップ',
  },
  languages: {
    title: '日本語・中国語・韓国語の画面のために',
    intro:
      '狭い画面で「プロフィールを編｜集」「保存更改并关｜闭」と割れるボタンを、もう出さない。右上の「テーマ」で色を変えても、文字は読めるまま。',
    browserNote: '語の途中で折れる',
    phraseNote: '語と文節の切れ目で折れる',
    details: {
      lineBreak: {
        title: '折り返し',
        body: 'ボタン・タイトル・表のセル・グラフの要約まで、日本語は文節、中国語は語、韓国語は空白の切れ目でだけ改行する。タイ語と英語には手を出さない。読み上げの名前とコピーされる文字列は変えない。',
      },
      theme: {
        title: 'テーマ',
        body: (presets: number): string =>
          `ライトとダーク、${String(presets)} のプリセットと任意の色。どの色を選んでも、文字と塗りが WCAG の基準を満たすように色を導く。`,
      },
      button: {
        title: 'ボタンの種類と状態',
        body: 'primary・secondary・tertiary と danger。押せる・処理中・ゲート中・使用不可を、色だけに頼らず形で見分けられる。',
      },
    },
  },
  promises: {
    title: 'ほかのライブラリが解いていない 4 つ',
    intro: '層 1（top layer・フォーカス・Esc）はブラウザがもう解いている。gassan が時間を使うのは、その上の設計の仕事である。',
    gate: {
      title: '活性化ゲート',
      body: '「最後まで読んだら」「チェックしたら」押せるボタンを、disabled を使わずに作る。押せば、何が足りないかを読み上げてそこへ連れて行く。',
      mockTitle: '利用規約の更新',
      mockButton: '同意して続ける',
      mockNote: '本文を最後まで読んでください',
    },
    clamp: {
      title: 'タイトルの省略',
      body: 'DOM の文字列を切らず、CSS の line-clamp だけで省略する。読み上げられる名前は常に完全。溢れたときだけ「全文を表示」が出る。',
      mockTitle: '2026年度 第3四半期 東北エリア 店舗別売上レポートの共有設定を変更する',
      mockToggle: '全文を表示',
    },
    reasons: {
      title: '閉じる理由',
      body: 'Esc・背景・×・送信・スワイプ・戻る・ページ遷移・外部からの close()。8 種を区別し、拒否するときも無言にしない。',
    },
    scrim: {
      title: 'スクリムのトークン',
      body: '黒 60% の決め打ちをやめ、意図別の 4 段階にする。既定は 32%・blur なし。モーダル唯一の強みである「文脈」を消さない。',
    },
  },
  kinds: {
    title: '5 つの類型から選ぶ',
    intro:
      'kind を 1 つ決めると、スクリムの濃さ・Esc と背景クリックの可否・配置の既定が決まる。複数に当てはまるなら、それは分割すべき 2 つのモーダルである。ボタンを押すと本物が開く。',
    items: {
      confirm: { label: '確認', use: '取り消せない操作の確認' },
      form: { label: '入力', use: '文脈を保ったままの副次入力' },
      view: { label: '閲覧', use: '詳細・メディアの拡大' },
      consent: { label: '同意', use: '規約・権限の明示同意' },
      flow: { label: 'フロー', use: '複数ステップの手続き' },
    },
    scrim: 'スクリム',
    esc: 'Esc',
    backdrop: '背景',
    closes: '閉じる',
    stays: '閉じない',
    more: '類型の決め方と意思決定マトリクス →',
  },
  verified: {
    title: '主張ではなく、検査結果として',
    intro: (items: number): string =>
      `仕様書の ${String(items)} 項目は、1 件残らずテスト名・CSS・ロードマップのどれかに結び付いている。存在しないテスト名を根拠に書くと CI が落ちる。`,
    count: (count: number): string => `${String(count)} 項目`,
    /** 状態の帯の読み上げ。「実装 120 項目、記述 10 項目」のように並べる。 */
    bar: (parts: readonly string[]): string => parts.join('、'),
    spec: (items: number): string => `${String(items)} 項目の振る舞い仕様を見る`,
    verification: '何を検証し、何を検証していないか →',
  },
  install: {
    title: '入れる',
    caption: 'インストール',
    more: '最小の例とブラウザ要件 →',
  },
};
