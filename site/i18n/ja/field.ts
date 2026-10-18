export default {
  lead: 'Modal.Field は 1 つの欄に、Modal.Fieldset は選択肢の束に、名前・ヘルプ・エラーを配線する。中身は gassan の入力部品でも、ネイティブの input でも、ほかのライブラリの部品でもよい。',
  field: {
    title: '配線を 1 箇所に',
    intro: 'render prop で id と aria-* を渡す。gassan の入力部品は、これをそのまま広げて受ける。',
    exampleTitle: 'メンバーを招待',
    exampleDescription: '空のまま「招待する」を押すと、まとめが 1 箇所に出て、フォーカスが最初のエラーへ移る。',
  },
  parts: {
    title: 'gassan の入力部品',
    tableCaption: '入力部品と、載っているページ',
    head: { page: 'ページ', parts: '部品' },
    body: [
      'どの部品も中身はネイティブの要素で、枠と印だけを描き替えている。キーボード操作・読み上げ・フォーム送信・スマホの専用 UI は、ブラウザのものがそのまま効く。ネイティブで足りないセレクト・コンボボックス・カレンダーだけを、WAI-ARIA APG のパターンどおりに作った（I-01〜I-15）。',
      '複数を選べるコンボボックスや、日付の範囲選択はまだ無い。要るときは、ほかのライブラリの部品を同じように Modal.Field で包む。モーダルの中のポップアップは、パネルの `transform` で `position: fixed` が壊れるので、popover API か dialog 内へのポータルを使う（C-12）。最小例は [docs/control-recipes.md](./docs/control-recipes.md) にある。',
    ],
  },
  errors: {
    title: 'エラーの出し方',
    callout:
      '個々のエラーに `role="alert"` は付けない。入力のたびに読み上げが割り込むと、かえって入力できなくなる。送信時のまとめだけを `Modal.Alert` に置き、フォーカスは最初のエラー項目へ移す（B-09）。',
  },
  apiControl: 'render prop の引数',
  apiAria: '入力部品が受ける配線（Field の外で名前を付けるとき）',
  a11yCaption: 'フォーム部品が満たす仕様',
};
