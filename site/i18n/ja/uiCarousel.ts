export default {
  lead: 'お知らせや導入事例を、横に送って見せる部品。指やトラックパッドではそのまま送れ、前へ・次へ・点・自動再生でも送れる。自動再生は止めるボタンを先頭に置き、ポインタやフォーカスが乗っている間は止まる。',
  news: {
    title: 'お知らせ（自動再生）',
    intro: '1 枚ずつ大きく見せる。autoplay で 6 秒ごとに送り、最後から最初へ回る。今の点に伸びる線が、次へ送るまでの残り時間。',
    exampleTitle: 'お知らせのカルーセル',
    exampleDescription: '左上のボタンで自動再生を止められる。ポインタが乗っている間とフォーカスが中にある間も止まり、離れると止めた所から続きを数える。',
  },
  cases: {
    title: '導入事例（何枚か並べる）',
    intro: 'minSlideWidth を渡すと、器の幅に収まるだけの枚数を並べる。点は、先頭に置ける位置の数だけ出る。',
    exampleTitle: '導入事例',
    exampleDescription: '画面の幅を狭めると、1 枚ずつになる。すべて見えているときは、前へ・次へも点も出ない。',
  },
  rules: {
    title: '自動再生が止まるとき',
    intro: '動き続けるものは、読み終える前に消えてしまう。WCAG 2.2.2 に沿って、止める手段と、止まる場面を決めてある。',
    tableCaption: '自動再生が止まるとき',
    head: { when: 'とき', then: 'その後' },
    rows: [
      { when: '止めるボタンを押した', then: '始めるボタンを押すまで送らない' },
      { when: 'ポインタが乗っている', then: '離れると、止めた所から続きを数える' },
      { when: 'フォーカスが中にある', then: '外へ出ると、止めた所から続きを数える' },
      { when: 'タブが隠れている', then: '戻ると、止めた所から続きを数える' },
      { when: '動きを減らす設定', then: '止めた状態で始める（始めるボタンで動かせる）' },
      { when: '最後のスライド（loop={false}）', then: 'そこで止める' },
    ],
  },
  access: {
    title: '読み上げとキー',
    intro: 'カルーセルは名前と「カルーセル」という役割の説明を持つ領域で、スライドは「5件中1件目」（または label）の名前を持つ。位置が変わると読み上げる。自動で送っている間は読み上げない。',
    tableCaption: 'カルーセルのキー操作',
    head: { key: 'キー', action: '動き' },
    rows: [
      { key: 'Tab', action: '止めるボタン → スライドの中のリンクやボタン → 前へ → 今の点 → 次へ、の順に止まる' },
      { key: 'Enter / Space（前へ・次へ）', action: '隣のスライドへ。端では押せない（loop なら反対の端へ回る）' },
      { key: '← / →（点）', action: '隣の点へ移り、そのスライドを先頭に置く' },
      { key: 'Home / End（点）', action: '最初の点・最後の点へ' },
    ],
  },
  codeCaption: '使い方',
  code: "import { Carousel } from '@genelab/gassan';\n\n<Carousel\n  label=\"お知らせ\"\n  autoplay\n  items={[\n    { id: 'dashboard', label: '新しいダッシュボード', content: <NewsSlide /> },\n    { id: 'invoices', label: '請求書をまとめてダウンロード', content: <NewsSlide /> },\n  ]}\n/>",
  a11yCaption: 'カルーセルの振る舞い',
};
