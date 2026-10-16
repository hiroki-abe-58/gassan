export default {
  lead: '作る前に、これから作るものがどれかを 1 つ選ぶ。型が決まれば、スクリム・配置・閉じ方・フッタの順序は意思決定マトリクスで自動的に決まる。',
  kinds: {
    title: '5 つの類型',
    intro: '複数に当てはまるなら、それは分割すべき 2 つのモーダルである。',
    tableCaption: 'モーダルの 5 類型',
  },
  live: {
    title: '動かしてみる',
    intro: 'どれも本物の gassan。閉じない設定の類型で Esc や背景を押すと、パネルが揺れて理由が読み上げられる。',
    confirm: {
      title: 'confirm — 確認',
      description: '小さく、中央に。Esc でも背景でも閉じられる。',
    },
    form: {
      title: 'form — 入力',
      description: '背景クリックでは閉じない。書きかけなら引き止める。',
    },
    view: {
      title: 'view — 閲覧',
      description: 'immersive スクリムのライトボックス。矢印キーで送れる。',
    },
    consent: {
      title: 'consent — 同意',
      description: '読了と同意が揃うまで primary は押せない。押せば理由が返る。',
    },
    flow: {
      title: 'flow — フロー',
      description: '戻る・現在地・閉じるの 3 スロット。',
    },
  },
  scrim: {
    title: 'スクリム',
    body: [
      '既定は黒 32%・blur なし。60〜80% の黒は背後の文脈を殺し、モーダル唯一の優位性を自ら捨てる。意図別の 4 段階と、blur を許す条件は [スクリム](#/styles/scrim) のページにまとめた。',
    ],
  },
  placement: {
    title: '配置',
    tableCaption: '配置の条件',
    callout:
      '`placement="auto"` は JS（matchMedia）で `center` か `sheet` に解決してから DOM に流す。CSS のメディアクエリで分岐させると、配置ごとの `@starting-style` を二重に持つことになり、必ず片方が腐る。',
  },
  dismiss: {
    title: '閉じ方の可否',
    intro: '○ は閉じる、✕ は閉じない、△ は条件付き（未保存の確認を挟むなど）。',
    tableCaption: '類型ごとの閉じ方',
    mockTitle: '利用規約の更新',
    mockNote: 'このダイアログはまだ閉じられません',
    do: '閉じない設定でも、Esc や背景クリックは「閉じたい」という明確な意思表示として受け取る。パネルを揺らし、理由を `role="status"` で読み上げる（L-10）。',
    dont: '無言で無視しない。何も起きなければ、利用者は壊れていると判断する。',
  },
  footer: {
    title: 'フッタのボタン順序',
    intro: 'DOM 順 = 視覚順 = Tab 順 = 読み上げ順。狭い画面でも反転させない。',
    orderTitle: '記事を公開する',
    cancel: 'キャンセル',
    draft: '下書き保存',
    publish: '公開する',
    orderDo: '狭幅では DOM 順のまま縦に積む。primary を上に置きたいなら、CSS ではなく DOM の順序そのものを変える。',
    orderDont:
      '`column-reverse` や `order` で見た目だけ入れ替えない。Tab と読み上げの順が視覚と逆になる（WCAG 1.3.2 / 2.4.3）。',
    dangerTitle: 'プロジェクトを削除',
    dangerCancel: 'やめる',
    dangerDelete: '削除する',
    dangerDo: '破壊的な操作は、位置はいつもの primary のまま、色だけ danger にする（F-06）。',
    dangerDont: '色と位置を同時に変えない。筋肉記憶が外れて、かえって誤操作を生む。',
  },
  gates: {
    title: '活性化ゲートの選び方',
    intro: '押せない状態を作ってよい条件は限られている。時間で待たせるのと、スクロール位置だけで判定するのは禁止。',
    tableCaption: 'ゲートに使ってよい条件',
    more: '[活性化ゲートの使い方 →](#/components/gate)',
  },
};
