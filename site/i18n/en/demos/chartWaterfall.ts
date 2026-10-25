import type ja from '../../ja/demos/chartWaterfall';

export default {
  label: 'MRR movement in October',
  description: 'New business and expansion added ¥950,000; contraction and churn took away ¥380,000. MRR closed the month at ¥5.39 million.',
  start: 'Opening MRR',
  newBusiness: 'New',
  expansion: 'Expansion',
  contraction: 'Contraction',
  churn: 'Churn',
  end: 'Closing MRR',
  comments: {
    total: "With kind: 'total' and no value, the bar shows the running total so far",
  },
} satisfies typeof ja;
