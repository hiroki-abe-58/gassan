import type ja from '../ja/slider';

export default {
  lead: 'Slider와 RangeSlider. 안쪽은 네이티브 range이며, 손잡이와 채우기는 테마의 강조색으로 그린다. 오른쪽 위의 테마를 바꾸면 이 페이지의 슬라이더 색도 바뀐다.',
  gallery: {
    title: '견본',
    intro: '채우기는 값의 위치까지. 트랙은 손잡이의 반지름만큼 안쪽으로 당겨, 채우기의 끝과 손잡이의 중심을 맞췄다.',
    items: {
      slider: '슬라이더',
      value: '값을 옆에 표시',
      range: '손잡이 2개',
      disabled: '사용 불가',
    },
    samples: {
      volume: '음량',
      opacity: '불투명도',
      price: '가격대',
      percent: '{0}%',
      yen: '¥{0}',
    },
  },
  modal: {
    title: '모달 안에서',
    intro: '값을 나타내는 방식(formatValue)은 옆의 표시와 읽어 주기(aria-valuetext) 모두에 쓴다.',
    exampleTitle: '검색 조건',
    exampleDescription: '가격대는 손잡이 2개로, 거리는 손잡이 1개로 고른다. 키보드에서는 ←→와 Home / End가 동작한다.',
  },
  theme: {
    title: '테마를 따른다',
    callout:
      '네이티브 range의 색은 브라우저의 소관이라, 모달 안에서는 기본 파란색 그대로였다. `accent-color`를 붙여도, 밝은 색에 덧붙는 테두리나 손잡이의 모양은 브라우저마다 다르다. gassan은 손잡이와 트랙을 다시 그리고, 값까지의 채우기를 `--g-accent`의 그라데이션으로 했다. 테마가 `--g-accent`를 바꾸면 손잡이와 채우기가 함께 바뀐다(I-10).',
  },
  a11yCaption: '슬라이더가 충족하는 명세',
} satisfies typeof ja;
