export default {
  lead: 'AI もベテランも、同じ順序で同じ穴を踏む。踏む前に機械的に照合できるよう、禁止事項・採点表・公開前チェックリストを置いておく。',
  prohibitions: {
    title: '禁止事項',
    intro: 'AI が書きがちな順に並べてある。1 つでも踏んだら書き直す。',
    tableCaption: '禁止事項',
  },
  rubric: {
    title: '品質ルーブリック',
    intro: '15 点満点。12 点未満は類型の選び直し（意思決定マトリクス）に戻る。',
    tableCaption: '品質ルーブリック',
    structureCaption: '採点の構造',
    /** 検算の型（仕様書の原文）の前に置く説明。 */
    formulaIntro: [
      '各実装について、次の形式で 1 文書く。「ただし」の後ろを埋められたら、それが減点理由である。埋まらなくなるまで直す。',
    ],
  },
  checklist: {
    title: '公開前チェックリスト',
    intro: '自分のモーダルで確かめながら使う。チェックはこの画面の中だけで、保存はしない。',
    progress: (done: number, total: number): string => `${String(done)} / ${String(total)} 項目`,
  },
  antipatterns: {
    title: 'アンチパターン変換表',
    intro: 'よく見る書き方と、その置き換え先。',
    tableCaption: 'アンチパターン変換表',
  },
};
