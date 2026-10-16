export default {
  lead: 'スクリムの仕事は「背後は今は触れない」と伝えること。背後を消すことではない。既定は黒 32%・blur なしで、意図に応じて 4 段階から選ぶ。',
  levels: {
    title: '4 つの段階',
    intro: '数値は src/styles.css のトークンから読んでいる。',
    mockTitle: '下書きを削除しますか',
    mockDelete: '削除する',
    tableCaption: 'スクリムのトークンと使う場面',
  },
  try: {
    title: '開いて比べる',
    exampleTitle: 'scrim の 4 段階',
    exampleDescription: '同じパネルを各段階のスクリムで開く。',
  },
  why: {
    title: 'なぜ 60% ではないのか',
    body: [
      '32% は Material Design 3 の scrim 規定と一致する。60〜80% の黒は、背後の文脈——モーダルが他の手段より優れている唯一の点——を自分で消してしまう。誰を削除しようとしているのか、どの行の詳細を見ているのかが分からなくなる。',
    ],
    mockTitle: 'この行を削除しますか',
    mockDelete: '削除する',
    do: '既定の 32%。背後の一覧が読めるので、何に対する操作かを見失わない。',
    dont: '黒 60〜80% を既定にしない。文脈を保つというモーダル唯一の強みを捨てている（§5 の 9）。',
  },
  blur: {
    title: 'blur を使ってよいとき',
    intro: 'blur は明示 opt-in（immersive）だけ。次をすべて満たす場合に限る。',
    body: [
      'blur を切るときの代替は「不透明度を上げる」。`prefers-reduced-transparency: reduce` では gassan が自動で blur を外し、そのぶん濃度を足す。ぼかしだけ消して 32% のままにすると、透明度を下げている人には何も伝わらない。',
    ],
  },
  dark: {
    title: 'ダークテーマ',
    intro: '黒いスクリムは暗い UI の上では機能しない。暗い背景に暗い膜を重ねても、分離は生まれない。',
    mockTitle: '設定を保存しますか',
    mockSave: '保存',
    do: '面を明るくし、境界線を 1px 引いて分離する（S-07）。',
    dont: 'スクリムを濃くして分離しようとしない。暗さが増えるだけで、パネルの輪郭は出てこない。',
  },
  spec: {
    title: 'スクリムの項目',
    tableCaption: 'スクリムの仕様',
  },
};
