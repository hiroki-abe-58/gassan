import type ja from '../../ja/demos/chartRadar';

export default {
  label: 'Our product against a competitor',
  description: 'We lead on ease of use and support, and trail on breadth of features and integrations.',
  axis: 'Aspect',
  ours: 'Us',
  rival: 'Competitor A',
  axes: {
    features: 'Features',
    ease: 'Ease of use',
    price: 'Price',
    support: 'Support',
    integrations: 'Integrations',
    security: 'Security',
  },
  comments: {
    max: 'The value at the outer ring. For a 5-point rating, set it to 5 so the rings run from 1 to 5',
  },
} satisfies typeof ja;
