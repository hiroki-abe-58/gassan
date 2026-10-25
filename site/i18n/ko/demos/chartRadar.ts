import type ja from '../../ja/demos/chartRadar';

export default {
  label: '자사와 경쟁사 평가',
  description: '사용 편의성과 지원에서 앞서고, 기능의 풍부함과 외부 연동에서 뒤처진다.',
  axis: '관점',
  ours: '자사',
  rival: '경쟁사 A',
  axes: {
    features: '기능의 풍부함',
    ease: '사용 편의성',
    price: '가격',
    support: '지원',
    integrations: '외부 연동',
    security: '보안',
  },
  comments: {
    max: '바깥 둘레의 값. 5단계 평가라면 5로 해서 고리를 1~5로 만든다',
  },
} satisfies typeof ja;
