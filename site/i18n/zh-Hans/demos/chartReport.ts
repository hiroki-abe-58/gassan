import type ja from '../../ja/demos/chartReport';

export default {
  jan: '1月',
  feb: '2月',
  mar: '3月',
  apr: '4月',
  may: '5月',
  open: '月度报告',
  title: '月度报告（1〜5 月）',
  label: '月度销售额（万元）',
  summary: '3 月最高，为 120 万元。4 月以后基本持平在 100 万元左右。',
  tableLabel: '月度销售额的原始数据',
  month: '月份',
  sales: '销售额（万元）',
  comments: {
    bars: '图用什么画都可以。gassan 不负责绘制。',
    chart: '名称（label）和趋势摘要（summary）必填。图本身默认为 aria-hidden（B-14）',
  },
} satisfies typeof ja;
