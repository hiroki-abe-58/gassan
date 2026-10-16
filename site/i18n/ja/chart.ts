export default {
  lead: 'グラフの器。描画はしない。持ち込んだ図に、名前と傾向の要約と元データの開閉を配線する。canvas 単体は、読み上げでは情報ゼロだからだ。',
  report: {
    title: '名前・要約・元データ',
    intro: 'label と summary は必須。図そのものは既定で aria-hidden になり、要約と元データが唯一の経路になる。',
    exampleTitle: '月次レポート',
    exampleDescription: '「元データを表示」を開くと、同じ数値が表で読める。',
  },
  why: {
    title: 'なぜ描かないのか',
    body: [
      '描画ライブラリは選択肢が多く、用途によって最適解が違う。gassan が持つと、どれかを選んだ瞬間に残りの利用者を裏切ることになる。だから図は SVG でも canvas でも、任意のライブラリでもよい。gassan が引き受けるのは、どの図にも共通して欠けがちな「名前」「傾向のテキスト代替」「元データへの到達」の 3 つだけである。',
      '図自体がキーボードで辿れるなど、それだけでアクセシブルなら `visualAccessible` で `aria-hidden` を外せる。',
    ],
    mockTitle: '月別の売上（万円）',
    mockSummary: '3月が最大の120万円。4月以降は横ばい。',
    mockDisclosure: '元データを表示',
    do: '図には名前と傾向の要約を添え、元データは表で開けるようにする。',
    dont: 'canvas や SVG を置いただけにしない。見えない人には「何もない」のと同じになる。',
  },
  a11yCaption: 'Modal.Chart が満たす仕様',
};
