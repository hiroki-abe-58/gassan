export default {
  lead: 'Slider と RangeSlider。中身はネイティブの range で、摘みと塗りはテーマのアクセント色で描く。右上のテーマを変えると、このページのスライダーの色も変わる。',
  gallery: {
    title: '見本',
    intro: '塗りは値の位置まで。線は摘みの半径ぶん内側に寄せて、塗りの端と摘みの中心をそろえている。',
    items: {
      slider: 'スライダー',
      value: '値を横に出す',
      range: '2 つ摘み',
      disabled: '使えない',
    },
    samples: {
      volume: '音量',
      opacity: '不透明度',
      price: '価格帯',
      percent: '{0}%',
      yen: '¥{0}',
    },
  },
  modal: {
    title: 'モーダルの中で',
    intro: '値の言い表し方（formatValue）は、横の表示と読み上げ（aria-valuetext）の両方に使う。',
    exampleTitle: '検索条件',
    exampleDescription: '価格帯は 2 つの摘みで、距離は 1 つの摘みで選ぶ。キーボードでは ←→ と Home / End が効く。',
  },
  theme: {
    title: 'テーマに追従する',
    callout:
      'ネイティブの range の色はブラウザの持ち物で、モーダルの中では既定の青のままだった。`accent-color` を付けても、明るい色に足される縁取りや摘みの形はブラウザごとに違う。gassan は摘みと線を描き直し、値までの塗りを `--g-accent` のグラデーションにした。テーマが `--g-accent` を変えれば、摘みと塗りが一緒に変わる（I-10）。',
  },
  a11yCaption: 'スライダーが満たす仕様',
};
