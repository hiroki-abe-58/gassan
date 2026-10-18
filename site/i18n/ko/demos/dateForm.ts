import type ja from '../../ja/demos/dateForm';

export default {
  open: '예약하기',
  title: '예약하기',
  date: '날짜',
  dateHelp: '오늘 이후',
  time: '시간',
  people: '인원',
  peopleUnit: '명',
  cancel: '취소',
  submit: '예약하기',
  comments: {
    today: '기기 시각 기준의 오늘(YYYY-MM-DD). sv-SE는 이 형식으로 출력한다',
    calendar: '달력은 top layer에 나타난다. 월 이름과 요일은 labels.locale의 Intl(I-13)',
    native: '시간은 네이티브 입력을 같은 테두리 안에 담는다(I-15)',
  },
} satisfies typeof ja;
