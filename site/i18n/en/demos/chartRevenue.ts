import type ja from '../../ja/demos/chartRevenue';

export default {
  locale: 'en-US',
  label: 'Monthly revenue and costs',
  description: 'Revenue peaked in December at ¥2.36 million. Costs rose gently every month, and the gap widened in the second half of the year.',
  month: 'Month',
  revenue: 'Revenue',
  cost: 'Costs',
  comments: {
    intl: 'Months are formatted with Intl, the way the viewer’s language writes them (“Mar”, “3月”)',
  },
} satisfies typeof ja;
