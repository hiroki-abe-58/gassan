import type ja from '../../ja/demos/chartReport';

export default {
  jan: '1월',
  feb: '2월',
  mar: '3월',
  apr: '4월',
  may: '5월',
  open: '월간 보고서',
  title: '월간 보고서(1~5월)',
  label: '월별 매출(만 엔)',
  summary: '3월이 120만 엔으로 최대. 4월 이후는 100만 엔 안팎에서 보합.',
  tableLabel: '월별 매출 원본 데이터',
  month: '월',
  sales: '매출(만 엔)',
  comments: {
    bars: '그림은 무엇으로 그려도 된다. gassan은 그리지 않는다.',
    chart: '이름(label)과 경향 요약(summary)은 필수. 그림 자체는 기본으로 aria-hidden(B-14)',
  },
} satisfies typeof ja;
