import type ja from '../../ja/demos/chartReport';

export default {
  jan: '1月',
  feb: '2月',
  mar: '3月',
  apr: '4月',
  may: '5月',
  open: '月報',
  title: '月報（1〜5 月）',
  label: '每月營收（萬日圓）',
  summary: '3 月最高，為 120 萬日圓。4 月以後持平在 100 萬日圓左右。',
  tableLabel: '每月營收的原始資料',
  month: '月份',
  sales: '營收（萬日圓）',
  comments: {
    bars: '圖表用什麼繪製都可以。gassan 不負責繪製。',
    chart: '名稱（label）與趨勢摘要（summary）為必填。圖表本身預設為 aria-hidden（B-14）',
  },
} satisfies typeof ja;
