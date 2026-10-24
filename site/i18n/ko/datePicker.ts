import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker와 DateRangePicker는 팝업 달력이고, Calendar와 RangeCalendar는 페이지 위에 두는 달력이다. 모두 일본의 공휴일과 주말을 색과 이름으로 보여 주고, 제목에서 월과 연도로 건너뛸 수 있다. 월 이름과 요일은 GassanProvider의 locale로 Intl에서 만들므로, 언어를 바꾸면 달력도 바뀐다.',
  gallery: {
    title: '견본',
    intro: '선택한 날은 강조색으로 채우고, 오늘에는 가는 링을 두른다. 일요일과 공휴일은 빨강, 토요일은 파랑.',
    items: {
      datePicker: '달력',
      rangePicker: '기간',
      limited: '오늘부터 30일까지',
      date: '날짜(네이티브)',
      time: '시간(네이티브)',
      color: '색(네이티브)',
    },
  },
  inline: {
    title: '페이지 위의 달력',
    intro: '예약 가능한 자리나 영업일처럼, 날짜를 보여 주면서 고르게 하고 싶을 때는 Calendar를 둔다. size="lg"는 컨테이너를 꽉 채우도록 넓어지고, 날짜 아래에 공휴일 이름을 쓴다.',
    exampleTitle: '방문 예약',
    exampleDescription: '수요일은 정기 휴무일이라 고를 수 없다. 점이 찍힌 날은 남은 자리가 얼마 없다.',
  },
  range: {
    title: '기간',
    intro: '시작일 → 종료일, 두 번 눌러 정한다. 거꾸로 눌러도 순서를 바꿔 준다. 종료일을 고르기 전에는 가리키고 있는 날까지를 임시 띠로 보여 준다.',
    exampleTitle: '보고서 내보내기',
    exampleDescription: '왼쪽 목록에서 “최근 7일” 등을 한 번에 고를 수 있다. 넓은 화면에서는 두 달을 나란히 놓는다.',
    body: [
      '지금 어느 쪽 끝을 고를 차례인지는 달력 아래에 표시하고, `role="status"`로 읽어 준다. 기간 양 끝의 날에는 접근 가능한 이름에 “시작일”, “종료일”을 덧붙인다.',
      '자주 쓰는 기간(오늘·어제·최근 7일·최근 30일·이번 달·지난달)은 `commonDateRanges(useLabels())`로 만들 수 있다. 이름은 `labels.rangePreset`에서 가져오므로, 언어를 바꾸면 함께 바뀐다.',
    ],
  },
  holidays: {
    title: '공휴일과 주말',
    intro: '일본의 공휴일은 「국민의 축일에 관한 법률」의 개정 내용을 연도별로 적용해 계산한다. 표를 갖고 있지 않으므로, 법이 바뀌지 않는 한 앞으로의 연도도 조회할 수 있다.',
    tableCaption: (year: number): string => `${String(year)}년 공휴일과 휴일`,
    head: { date: '날짜', name: '이름' },
    body: [
      '대체 휴일(2007년부터는 “그 뒤로 처음 오는, 휴일이 아닌 날”), 공휴일 사이에 낀 국민의 휴일, 해피 먼데이 제도, 도쿄 2020 대회의 특례, 레이와 즉위에 따른 휴일까지 포함한다. 춘분의 날과 추분의 날은 근사식으로 구한다(정식 날짜는 전년도 2월에 공표된다).',
      '이름은 `labels.holidays`에서 나온다. 일본어 문자열은 기본으로 일본의 공휴일을 표시하고, 영어 문자열은 기본으로 표시하지 않는다. 컴포넌트마다 `holidays`로 바꿀 수 있고, `null`을 넘기면 표시하지 않는다. 회사의 휴무일을 더하려면 `japaneseHolidayResolver()` 위에 겹친 함수를 넘긴다.',
      '색만으로 전하지 않는다. 공휴일 이름은 날짜의 접근 가능한 이름에 들어가고, 화면에서는 작은 달력이면 아래 한 줄에 가리키고 있는 날의 공휴일이, 큰 달력이면 날짜 아래에 나온다. 일요일·공휴일의 빨강(`--g-sunday`)과 토요일의 파랑(`--g-saturday`)은 표면에 대해 4.5:1 이상이다. 요일을 색으로 구분하지 않는 지역에서는 두 토큰에 `--g-fg`를 넣으면 된다.',
    ],
    codeCaption: '공휴일 표시 방법 바꾸기',
    code: "import { japaneseHolidayResolver, japaneseHoliday } from '@genelab/gassan';\n\n// 회사의 휴무일을 더한다\nconst closed: Record<string, string> = { '2026-12-29': '연말 휴무', '2026-12-30': '연말 휴무' };\nconst holidays = (date: string) => closed[date] ?? japaneseHolidayResolver()(date);\n\n<Modal.DatePicker holidays={holidays} />\n\n// 공휴일을 표시하지 않는다\n<Modal.DatePicker holidays={null} />\n\n// 하루만 조회한다\njapaneseHoliday('2026-09-22'); // { date: '2026-09-22', key: 'citizens', name: \"国民の休日\" } (이름은 기본으로 일본어)",
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
      { key: 'Enter / Space', action: '확정하고 닫은 뒤 버튼으로 돌아간다(기간은 첫 번째로 누르면 시작일, 두 번째로 누르면 종료일)' },
      { key: 'Esc', action: '확정하지 않고 닫은 뒤 버튼으로 돌아간다(모달은 닫지 않는다). 월·연도 목록에서는 한 단계 돌아간다' },
    ],
    note: '제목(“2026년 10월”)을 누르면 월 목록, 한 번 더 누르면 연도 목록이 된다. 목록 안에서도 화살표 키로 움직이고, Enter로 한 단계 내려간다. “오늘”을 누르면 오늘로 돌아간다.',
  },
  native: {
    title: '네이티브 날짜 입력과 구분해 쓰기',
    body: [
      '스마트폰에서는 OS의 날짜 휠이 더 빠른 경우가 많다. 요일이나 공휴일을 보면서 고르게 하고 싶을 때, 고를 수 없는 날을 보여 주고 싶을 때, 기간을 고르게 하고 싶을 때, 겉모습을 다른 컴포넌트와 맞추고 싶을 때는 DatePicker를 쓴다. 그렇지 않으면 `type="date"`를 Modal.Input에 넣는다. 테두리와 명암(`--g-color-scheme`)은 똑같아진다(I-15).',
    ],
  },
  apiCaption: {
    datePicker: 'Modal.DatePicker',
    rangePicker: 'Modal.DateRangePicker',
    calendar: 'Modal.Calendar',
    rangeCalendar: 'Modal.RangeCalendar',
  },
  a11yCaption: '날짜와 시간이 충족하는 명세',
} satisfies typeof ja;
