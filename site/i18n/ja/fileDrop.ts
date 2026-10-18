export default {
  lead: 'FileDrop はファイルの受け皿。中身はネイティブの file input を受け皿いっぱいに広げたもので、押しても、Enter / Space でも、ドロップでも選べる。',
  gallery: {
    title: '見本',
    intro: '選んだファイルは名前と大きさの一覧に出し、1 つずつ取り除ける。',
    items: {
      single: '1 つだけ',
      multiple: '複数（画像だけ）',
      disabled: '使えない',
    },
  },
  modal: {
    title: 'モーダルの中で',
    intro: '中身はネイティブの input なので、Modal.Field の label がそのまま名前になる。',
    exampleTitle: '書類を提出する',
    exampleDescription: 'PDF と画像だけを受ける。ほかの形式を落とすと、エラーとして知らせる。',
  },
  reject: {
    title: '合わないファイル',
    callout:
      'ドロップされたファイルは、ネイティブの `accept` を通らない。gassan は同じ規則（拡張子・`image/*` のようなワイルドカード・型）を当て、外れたものを `onReject` に渡す。知らせ方は `Modal.Field` の `error` に任せる（I-14）。',
  },
  a11yCaption: 'ファイルの受け皿が満たす仕様',
};
