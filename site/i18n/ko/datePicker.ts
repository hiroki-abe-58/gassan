import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker는 달력으로 날짜를 고른다. 시간과 색은 네이티브 입력을 Modal.Input의 테두리 안에 담는다. 월 이름과 요일은 GassanProvider의 locale로 Intl에서 만들므로, 언어를 바꾸면 달력도 바뀐다.',
  gallery: {
    title: '견본',
    intro: '선택한 날은 강조색으로 채우고, 오늘에는 가는 링을 두른다.',
    items: {
      datePicker: '달력',
      limited: '오늘부터 30일까지',
      date: '날짜(네이티브)',
      time: '시간(네이티브)',
      color: '색(네이티브)',
    },
  },
  modal: {
    title: '모달 안에서',
    intro: '달력은 popover로 top layer에 나타난다. Esc는 달력만 닫고, 버튼으로 포커스를 되돌린다.',
    exampleTitle: '예약하기',
    exampleDescription: '날짜는 달력으로, 시간은 네이티브 입력으로 고른다. 지난 날짜는 고를 수 없다.',
  },
  keys: {
    title: '키 조작',
    tableCaption: '달력의 키 조작',
    head: { key: '키', action: '동작' },
    rows: [
      { key: '← / →', action: '하루 전·하루 뒤' },
      { key: '↑ / ↓', action: '한 주 전·한 주 뒤' },
      { key: 'Home / End', action: '주의 시작·끝' },
      { key: 'PageUp / PageDown', action: '한 달 전·한 달 뒤(월말은 그 달의 마지막 날로 맞춘다)' },
      { key: 'Shift + PageUp / PageDown', action: '1년 전·1년 뒤' },
      { key: 'Enter / Space', action: '확정하고 닫은 뒤 버튼으로 돌아간다' },
      { key: 'Esc', action: '확정하지 않고 닫은 뒤 버튼으로 돌아간다(모달은 닫지 않는다)' },
    ],
  },
  native: {
    title: '네이티브 날짜 입력과 구분해 쓰기',
    body: [
      '스마트폰에서는 OS의 날짜 휠이 더 빠른 경우가 많다. 요일을 보면서 고르게 하고 싶을 때, 고를 수 없는 날을 보여 주고 싶을 때, 겉모습을 다른 컴포넌트와 맞추고 싶을 때는 DatePicker를 쓴다. 그렇지 않으면 `type="date"`를 Modal.Input에 넣는다. 테두리와 명암(`--g-color-scheme`)은 똑같아진다(I-15).',
    ],
  },
  a11yCaption: '날짜와 시간이 충족하는 명세',
} satisfies typeof ja;
