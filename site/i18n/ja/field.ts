export default {
  lead: 'Modal.Field はラベル・ヘルプ・エラーの配線だけを引き受け、中身の入力は作らない。Chips・Switch・Table・Alert は、モーダルの中でよく要るのに配線を間違えやすい部品だけを持つ。',
  field: {
    title: '配線を 1 箇所に',
    intro: 'render prop で id と aria-* を渡す。中身はネイティブの input でも、ほかのライブラリの部品でもよい。',
    exampleTitle: 'メンバーを招待',
    exampleDescription: '空のまま「招待する」を押すと、まとめが 1 箇所に出て、フォーカスが最初のエラーへ移る。',
  },
  delegate: {
    title: 'コントロールは自作しない',
    tableCaption: '入力部品の任せ先',
    head: { control: '部品', use: 'どうするか' },
    rows: [
      { control: 'range / date / time / file / select', use: 'ネイティブの input をそのまま Modal.Field で包む' },
      { control: 'ラジオ・複数チェック', use: 'fieldset と legend で名前を付ける（label ではなく）' },
      { control: '検索つきセレクト・コンボボックス・2 つ摘みのスライダー', use: 'Base UI などの専用ライブラリに任せる' },
    ],
    body: [
      'それぞれの最小例は [docs/control-recipes.md](./docs/control-recipes.md) にある。モーダルの中のポップアップは、パネルの `transform` で `position: fixed` が壊れるので、popover API か dialog 内へのポータルを使う（C-12）。',
    ],
  },
  errors: {
    title: 'エラーの出し方',
    callout:
      '個々のエラーに `role="alert"` は付けない。入力のたびに読み上げが割り込むと、かえって入力できなくなる。送信時のまとめだけを `Modal.Alert` に置き、フォーカスは最初のエラー項目へ移す（B-09）。',
  },
  apiControl: 'render prop の引数',
  a11yCaption: 'フォーム部品が満たす仕様',
};
