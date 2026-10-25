import type ja from '../../ja/demos/chartWaterfall';

export default {
  label: '10 月 MRR 的增减',
  description: '新增和扩展带来 95 万日元的增长，缩减和流失减少了 38 万日元。月末 MRR 为 539 万日元。',
  start: '月初 MRR',
  newBusiness: '新增',
  expansion: '扩展',
  contraction: '缩减',
  churn: '流失',
  end: '月末 MRR',
  comments: {
    total: "设为 kind: 'total' 并省略值时，会画成截至此处的合计柱条",
  },
} satisfies typeof ja;
