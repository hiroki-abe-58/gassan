export default {
  lead: '「最後まで読んだら」「チェックしたら」「3 つ選んだら」押せるボタンを、disabled を使わずに作る。押せば、何が足りないかを読み上げ、そこへ連れて行く。',
  consent: {
    title: '読了と同意',
    intro: 'Modal.Body の readGate と Modal.Consent が、それぞれ名前付きのゲートを登録する。gate を付けたボタンは、全部が満たされるまで押せない。',
    exampleTitle: '利用規約の更新',
    exampleDescription: '読む前に「同意して続ける」を押してみる。理由が読み上げられ、本文へ 1 画面ぶん送られる。',
  },
  custom: {
    title: '任意の条件',
    intro: 'Modal.Gate に satisfied と reason を渡せば、どんな条件でもゲートにできる。focus を渡すと、押されたときにそこへ連れて行く。',
    exampleTitle: '3 つ以上選ぶ',
  },
  selector: {
    title: 'ボタンがどのゲートを見るか',
    tableLabel: 'gate の書き方',
    tableCaption: 'gate の書き方と、登録前の状態',
    head: { code: '書き方', before: '登録前', meaning: '意味' },
    rows: [
      { code: 'gate / gate={true}', before: '閉じる', meaning: '登録済みの全ゲートを見る。登録が出揃うまでは「まだ分からない」' },
      { code: "gate={['terms']}", before: '閉じる', meaning: '名前で指定する。未登録の名前は未充足として扱う' },
      { code: 'gate={[]}', before: '開く', meaning: '条件ゼロと確定している。待つ理由が無い' },
    ],
    body: [
      'ゲートは子の effect で登録される。サーバーでは effect が走らず、クライアントでも最初のレンダーでは走っていない。その窓で登録簿は空になるが、それは「条件が無い」ではなく「まだ分からない」である。だから `gate` を付けたボタンは、サーバー側のマークアップでも `aria-disabled="true"` で出て、マウント後に実際の条件へ差し替わる。サーバーと初回レンダーが一致するので、hydration のずれも起きない（G-12）。',
    ],
  },
  rules: {
    title: 'ゲートにしてはいけない条件',
    callout:
      '「N 秒待ったら押せる」は作らない（WCAG 2.2.1）。「スクロール位置が末尾に来たら」だけで判定しない（仮想カーソルの利用者が永久に進めない）。押せない状態を作ってよいのは、フォームの妥当性・明示の同意・法的に必要な読了だけである。',
    codeCaption: '押されたときに起きること',
    code: '// 1. 理由を role="status" のライブリージョンで読み上げる（G-07）\n// 2. 詰まっている場所へ連れて行く（G-08）\n//    未読なら本文を 1 画面ぶん送る。末尾まで一気に送らない（ゲートの意味が消える）\n//    未チェックならチェックボックスへフォーカス\n// 3. onClick は呼ばない',
  },
  a11yCaption: '活性化ゲートの仕様',
};
