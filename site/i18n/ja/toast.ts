export default {
  lead: '処理が終わったことを、作業の邪魔をせずに知らせる通知。`toast()` を呼ぶと画面の端に出て、下端のメーターが残り時間だけ縮み、時間が来ると閉じる。× や Esc、横に払う操作でも閉じられる。モーダルが開いていても、その上に出て押せる。',
  tones: {
    title: '見本',
    intro: '印と色は、成功・お知らせ・注意・失敗の 4 つと、印のない既定。色は印とメーターにだけ載せ、面は他の部品と同じにする（囲みの強調はしない）。',
    exampleTitle: 'トーンの違い',
    exampleDescription: 'ボタンを押すと右下に出る。ポインタを乗せている間はメーターが止まる。',
  },
  meter: {
    title: '残り時間のメーター',
    intro: '下端の線が、残り時間に比例して縮む。薄い下地が全体の長さを見せるので、あとどれくらいで消えるかが一目で分かる。',
    body: [
      'ポインタが乗っている間、フォーカスが中にある間、タブが隠れている間、指で動かしている間は、時間もメーターも止まる。読んでいる途中で消さない（WCAG 2.2.1 / 2.2.2）。止める前の残り時間から続きを数える。',
      'メーターは残り時間を伝える情報なので、動きの段を `none` にしても止めない。OS の「動きを減らす」設定では、滑らかに縮めず 1 秒ごとに刻む。',
      '時間は `duration`（ms）で変えられる。`Infinity` を渡すと時間では閉じず、メーターも出さない。',
    ],
    tableCaption: '既定の長さ',
    head: { kind: '種類', duration: '長さ' },
    rows: [
      { kind: '印なし・成功・お知らせ', duration: '5 秒' },
      { kind: '注意・失敗', duration: '8 秒（読み直す時間を見込む）' },
      { kind: 'ボタンの付いたもの', duration: '10 秒以上（押しに行く時間を見込む）' },
      { kind: '読み込み中（toast.promise）', duration: '時間では閉じない' },
    ],
  },
  action: {
    title: '元に戻す',
    intro: '取り消せる操作の後は、確認のモーダルで止めるより、すぐに実行してトーストに「元に戻す」を付けるほうが速い。ボタンは 1 つだけ置ける。',
    exampleTitle: '下書きを削除する',
    exampleDescription: '削除はすぐに効く。10 秒の間に「元に戻す」を押せば戻る。',
  },
  promise: {
    title: '処理の間',
    intro: '`toast.promise` は、処理の間は読み込み中のトーストを出し（時間では閉じない）、終わったら同じ場所で成功か失敗に置き換える。',
    exampleTitle: '保存する',
    exampleDescription: '1.5 秒かかる保存を、成功と失敗の両方で試せる。',
  },
  position: {
    title: '出す場所',
    intro: '上下と左・中央・右の 6 か所。既定は右下（右から左に書く言語では左下）。上に出すときは新しいものを上に置き、見た目の順と読み上げの順をそろえる。',
    choose: '出す場所',
    labels: {
      'top-start': '左上',
      'top-center': '上',
      'top-end': '右上',
      'bottom-start': '左下',
      'bottom-center': '下',
      'bottom-end': '右下',
    },
    try: '出してみる',
    message: (place: string): string => `${place}に出しました`,
    body: [
      '同時に見せる数は `max`（既定 3）。超えると古いものから閉じる。閉じると、残りが滑って隙間を詰める。',
      '出入りの動きは、動きの段のトークンに従う。`expressive` では端からバネで入り、`none` では動かずに現れて消える。',
    ],
  },
  modal: {
    title: 'モーダルの上',
    intro: 'モーダルが開いている間、モーダルの外の要素は押せず、読み上げからも消える（top layer に出していても同じ）。トーストはモーダルが開くと最前面のダイアログの中へ移り、その上に出し直す。',
    exampleTitle: 'モーダルの中でコピーする',
    exampleDescription: 'トーストはモーダルの上に出て、× で閉じられる。トーストの上で Esc を押しても、モーダルは閉じない。',
    body: [
      '移っても残り時間とメーターは続きから動く。モーダルを閉じると元の場所へ戻る。',
    ],
  },
  keys: {
    title: '操作',
    tableCaption: 'トーストの操作',
    head: { key: '操作', action: '動き' },
    rows: [
      { key: 'Tab', action: 'トーストのボタンへ移る。フォーカスが中にある間は時間が止まる' },
      { key: 'Esc', action: 'フォーカスのあるトーストを閉じる（モーダルは閉じない）' },
      { key: 'Enter / Space', action: 'ボタン（元に戻す・×）を押す。閉じたら隣のトーストへ、最後なら元の場所へフォーカスを戻す' },
      { key: '横に払う', action: '払った向きへ流して閉じる（幅の 35% か、素早く払う）' },
    ],
  },
  host: {
    title: '置き方',
    body: [
      '`<ToastHost />` をアプリのルートに 1 つだけ置く。`toast()` はどこから呼んでもそこに描く。ホストが無いまま呼ぶと開発時に警告が出る。',
      '通知の領域は「通知」という名前のランドマークで、`aria-live="polite"` を持つ。領域はトーストが無いときも置いたままにする（読み上げの領域は、中身より先にあると確かに読まれる）。',
    ],
  },
  apiCaption: {
    functions: 'toast の関数',
    head: { call: '呼び方', returns: '返り値', description: '説明' },
    rows: [
      { call: 'toast(message, options?)', returns: 'id', description: '印のないトーストを出す。options.tone でトーンを選べる' },
      { call: 'toast.success / info / warning / error(message, options?)', returns: 'id', description: 'トーンを決めて出す' },
      { call: 'toast.promise(promise, messages, options?)', returns: 'Promise', description: '処理の間は読み込み中を出し、終わったら置き換える。渡した Promise をそのまま返す' },
      { call: 'toast.dismiss(id?)', returns: '—', description: '閉じる。id を省くと全部' },
    ],
  },
  a11yCaption: 'トーストが満たす仕様',
};
