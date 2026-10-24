import type ja from '../../ja/demos/chartRevenue';

export default {
  locale: 'ko-KR',
  label: '월별 매출과 비용',
  description: '매출은 12월의 236만 엔이 최대. 비용은 매달 완만하게 늘었고, 차이는 하반기에 벌어졌다.',
  month: '월',
  revenue: '매출',
  cost: '비용',
  comments: {
    intl: '월은 Intl로, 보는 사람의 언어 표기에 맞춘다(“3월”, “Mar”)',
  },
} satisfies typeof ja;
