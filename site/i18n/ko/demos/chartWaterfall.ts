import type ja from '../../ja/demos/chartWaterfall';

export default {
  label: '10월 MRR 증감',
  description: '신규와 확장으로 95만 엔 늘고, 축소와 해지로 38만 엔 줄었다. 월말 MRR은 539만 엔.',
  start: '월초 MRR',
  newBusiness: '신규',
  expansion: '확장',
  contraction: '축소',
  churn: '해지',
  end: '월말 MRR',
  comments: {
    total: "kind: 'total'로 하고 값을 생략하면, 그때까지의 합계 막대가 된다",
  },
} satisfies typeof ja;
