import type ja from '../../ja/demos/bookingCalendar';

export default {
  label: '방문일',
  selected: '선택한 날짜: {0}',
  empty: '날짜를 선택하세요',
  comments: {
    today: '기기 시각 기준의 오늘(YYYY-MM-DD). sv-SE는 이 형식으로 출력한다',
    large: 'size="lg"는 컨테이너를 꽉 채우도록 넓어지고, 날짜 아래에 공휴일 이름을 쓴다. 정기 휴무일은 고를 수 없고, 점이 찍힌 날은 남은 자리가 얼마 없다(I-16 / I-19)',
  },
} satisfies typeof ja;
