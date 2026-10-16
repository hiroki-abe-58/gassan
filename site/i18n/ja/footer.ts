export default {
  lead: 'フッタのボタンは 3 階層まで。DOM 順 = 視覚順 = Tab 順で書き、二重送信は原理的に起きないようにする。',
  hierarchy: {
    title: 'ボタンの階層',
    intro: 'primary・secondary・tertiary を 1 つずつ。弱い順に書けば、最初の tertiary だけが左へ離れる。',
    exampleTitle: '記事を公開する',
    exampleDescription: '「公開する」を連打しても 1 回しか走らない。⌘ / Ctrl + Enter でも primary が押せる。',
  },
  loading: {
    title: '処理中',
    body: [
      '`onAction` が Promise を返すと、解決するまでボタンは処理中になる。そのあいだのクリックは握りつぶすので、二重送信は原理的に起きない。外から `loading` を渡しても、内部の処理中とは**論理和**で合成する。`loading={false}` は「自分の都合では処理中ではない」であって、「onAction の最中でも押させてよい」ではないからだ（F-08）。',
      '処理中のラベルは `opacity: 0` で隠してスピナーを重ねる。`visibility: hidden` にすると名前ごと消え、「名前のないボタン」になる（F-07 / §10-4）。幅も変わらない。',
    ],
    callout: '`onAction` が reject しても処理中は必ず解ける。押せないまま固まるボタンは作らない。',
  },
  danger: {
    title: '破壊的な操作',
    mockTitle: 'プロジェクトを削除',
    mockCancel: 'やめる',
    mockDelete: '削除する',
    do: '`variant="danger"` は primary の位置のまま、色だけを変える。',
    dont: '破壊的なボタンに初期フォーカスを当てない。Enter 一回で取り返しがつかなくなる（K-05）。',
  },
  a11yCaption: 'フッタとボタンが満たす仕様',
};
