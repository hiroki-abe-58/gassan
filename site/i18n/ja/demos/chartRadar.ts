export default {
  label: '自社と競合の評価',
  description: '使いやすさとサポートで上回り、機能の多さと外部との連携で下回る。',
  axis: '観点',
  ours: '自社',
  rival: '競合 A',
  axes: {
    features: '機能の多さ',
    ease: '使いやすさ',
    price: '価格',
    support: 'サポート',
    integrations: '外部との連携',
    security: '安全性',
  },
  comments: {
    max: '外周の値。5 段階の評価なら 5 にして、輪を 1〜5 にする',
  },
};
