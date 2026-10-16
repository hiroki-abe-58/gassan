export default {
  lead: '層 1〜3 を受け持つ器。<dialog> と showModal() に top layer・フォーカス・Esc を任せ、スクリム・パネル・ライブリージョンを置き、閉じる要求を理由つきで 1 本の経路に集める。',
  playground: {
    title: 'kind で決まること',
    intro: 'kind・size・placement・scrim を変えて開く。閉じない設定のとき、Esc や背景を押すと揺れて理由が読み上げられる。',
    exampleTitle: 'Modal.Root のプレイグラウンド',
  },
  reasons: {
    title: '閉じる理由',
    intro: 'onOpenChange(false, reason) は必ず理由を伴う。「Esc で閉じたときだけ下書きを保存する」のような分岐が書ける。',
    tableLabel: '閉じる理由の一覧',
    tableCaption: 'CloseReason の 8 種',
    from: '発生源',
    refuse: '拒否できる経路',
    /** キーは CloseReason。並びはページ側が持つ。 */
    rows: {
      esc: { from: 'Esc キー。ネイティブの cancel を必ず止め、ここに合流させる', refuse: 'dismiss.esc / onRequestClose' },
      backdrop: { from: 'スクリムの押下。押した点と離した点の両方がスクリム上のときだけ', refuse: 'dismiss.backdrop / onRequestClose' },
      'close-button': { from: 'Modal.Close、または closeOnClick="close-button" のボタン', refuse: 'onRequestClose' },
      'back-button': { from: 'closeOnBack のときのブラウザバック（最前面の 1 枚だけが応答）', refuse: 'onRequestClose' },
      submit: { from: 'closeOnClick="submit" のボタン、または <form method="dialog">', refuse: 'onRequestClose（ボタン経由のとき）' },
      programmatic: { from: '外部から dialog.close() が呼ばれた', refuse: '—（既に閉じている。後始末だけ行う）' },
      swipe: { from: 'シートの下フリック（swipeToDismiss）', refuse: 'dismiss.backdrop / onRequestClose' },
      'route-change': { from: 'routeKey が変わった（Next.js なら usePathname() を渡す）', refuse: 'onRequestClose' },
    },
  },
  guard: {
    title: '引き止める',
    intro: 'onRequestClose が false（または false に解決する Promise）を返すと閉じない。拒否したときは無言にせず、揺らして理由を読み上げる。',
    exampleTitle: '書きかけのフォームを引き止める',
    exampleDescription: '何か入力してから Esc か × を押す。確認がもう 1 枚上に重なる。',
  },
  mount: {
    title: '常時マウントと後始末',
    body: [
      'モーダルは常に描いておき、`open` で開閉する。閉じる要求を受けると `data-exiting` を付けて退出を描き、`--g-dur-out` 待ってから `close()` する。中身のリセット（`resetOnClose`）・フォーカスの復帰・スクロールロックの解除・`onExited` は、すべて `close()` の後に行う。',
    ],
    callout:
      '入れ子もできる（L-11）。内側の Esc や Cmd/Ctrl + Enter が外側まで届かないよう、イベントは「最も近い dialog が自分のときだけ」通している。2 枚重ねてもスクリムは 1 枚ぶんの濃さのまま（L-12）。',
  },
  a11yBody: [
    'フォーカスの閉じ込め・背景の inert 化・Esc・フォーカスの復帰は `showModal()` が行う。Root が自分で持つのは、名前の配線、ライブリージョン 1 つ、初期フォーカスの置き場所、閉じる経路の一本化である。',
  ],
  a11yCaption: 'Modal.Root が満たす仕様',
};
