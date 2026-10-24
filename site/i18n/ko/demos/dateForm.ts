import type ja from '../../ja/demos/dateForm';

export default {
  open: '예약하기',
  title: '예약하기',
  date: '날짜',
  dateHelp: '오늘 이후',
  time: '시간',
  timeHelp: '11:00~21:00, 15분 간격',
  people: '인원',
  peopleUnit: '명',
  cancel: '취소',
  submit: '예약하기',
  comments: {
    today: '기기 시각 기준의 오늘(YYYY-MM-DD). sv-SE는 이 형식으로 출력한다',
    calendar: '달력은 top layer에 나타난다. 월 이름과 요일은 labels.locale의 Intl(I-13)',
    time: '시간은 시와 분의 열에서 고른다. 간격에 맞지 않는 시간과 영업시간 밖은 고를 수 없다(I-20)',
  },
} satisfies typeof ja;
