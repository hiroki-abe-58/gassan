export default {
  lead: 'placement="sheet" は下から出るパネルになる。detents を渡すと peek / half / full で止まる。つまみは見た目の飾りではなく、キーボードでも動かせる操作子である。',
  detents: {
    title: '段で止まるシート',
    intro: 'つまみをドラッグ、またはフォーカスして ↑ ↓ で段を移る。いまの段は onDetentChange で受け取れる。',
    exampleTitle: '月山への経路',
    exampleDescription: '狭い画面なら指で、広い画面ならキーボードとクリックで試せる。',
  },
  rules: {
    title: '3 つの決めごと',
    items: [
      {
        title: '速い下フリックは閉じない。1 段下げる',
        body: '段がある以上、利用者は「少し縮めたい」つもりで投げる。閉じるのは、最下段からさらに下へ投げたときだけ。',
      },
      {
        title: 'つまみはドラッグ専用にしない',
        body: '段があるときは role="slider" になり、矢印キー・Home / End・クリックでも段を移れる。ドラッグできない人の経路を消さない。',
      },
      {
        title: '段を指定しなければ、内容なりの高さ',
        body: 'つまみは飾り（aria-hidden）に落ちる。動かせないものを操作子として読み上げさせない。',
      },
    ],
  },
  release: {
    title: '指を離したあと',
    body: [
      'ドラッグの判定そのものより、指を離したあとにブラウザが勝手に起こすことのほうが壊れやすい。ドラッグ直後の合成 click で段が二重に動く、パネルの外で指を離すと固まる、同じ段に戻ると高さの指定が消える——どれも実際に踏んで、直して、テストで固定してある（§10-13〜§10-15）。',
    ],
    callout:
      '行き先の判定は `resolveDetents` / `snapToDetent` という純粋関数に切り出してあり、単体で import できる。レイアウトを持たないテスト環境でも検証できるようにするためだ。',
  },
  api: {
    body: [
      '段そのものは `Modal.Root` の `detents` / `defaultDetent` / `onDetentChange` / `swipeToDismiss` で指定する（[Modal.Root の API](#/components/root/api)）。',
    ],
  },
  a11yCaption: 'シートとモバイルの仕様',
};
