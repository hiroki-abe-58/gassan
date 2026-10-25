import type ja from '../../ja/demos/scrollMonthly';

export default {
  locale: 'zh-CN',
  label: '月度销售额（万日元）',
  plan: '套餐',
  plans: { free: 'Free', pro: 'Pro', max: 'Max', enterprise: 'Enterprise' },
  comments: {
    sales: '各套餐的月度销售额（万日元）',
  },
} satisfies typeof ja;
