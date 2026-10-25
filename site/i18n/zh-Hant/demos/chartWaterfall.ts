import type ja from '../../ja/demos/chartWaterfall';

export default {
  label: '10 月 MRR 的增減',
  description: '新增與擴展帶來 95 萬日圓的成長，縮減與流失減少了 38 萬日圓。月底 MRR 為 539 萬日圓。',
  start: '月初 MRR',
  newBusiness: '新增',
  expansion: '擴展',
  contraction: '縮減',
  churn: '流失',
  end: '月底 MRR',
  comments: {
    total: "以 kind: 'total' 省略值時，會成為到此為止的合計長條",
  },
} satisfies typeof ja;
