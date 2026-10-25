import type ja from '../../ja/demos/scrollMonthly';

export default {
  locale: 'ko-KR',
  label: '월별 매출(만 엔)',
  plan: '요금제',
  plans: { free: 'Free', pro: 'Pro', max: 'Max', enterprise: 'Enterprise' },
  comments: {
    sales: '요금제별 월 매출(만 엔)',
  },
} satisfies typeof ja;
