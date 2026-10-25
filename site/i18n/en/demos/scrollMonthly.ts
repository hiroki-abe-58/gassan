import type ja from '../../ja/demos/scrollMonthly';

export default {
  locale: 'en-US',
  label: 'Monthly revenue (¥10k)',
  plan: 'Plan',
  plans: { free: 'Free', pro: 'Pro', max: 'Max', enterprise: 'Enterprise' },
  comments: {
    sales: 'Monthly revenue by plan (¥10k)',
  },
} satisfies typeof ja;
