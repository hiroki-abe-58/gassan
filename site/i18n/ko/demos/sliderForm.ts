import type ja from '../../ja/demos/sliderForm';

export default {
  open: '검색 조건',
  title: '검색 조건',
  price: '가격대',
  yen: '¥{0}',
  distance: '역에서의 거리',
  km: '{0}km 이내',
  cancel: '취소',
  apply: '이 조건으로 찾기',
  comments: {
    range: '손잡이 2개는 range 2개를 겹친 것. 이름은 “최솟값”“최댓값”이고, 그룹의 이름은 legend(I-10)',
    format: 'formatValue는 옆의 표시와 aria-valuetext 모두에 쓴다',
  },
} satisfies typeof ja;
