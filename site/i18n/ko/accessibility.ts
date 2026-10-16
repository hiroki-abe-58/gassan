import type ja from '../ja/accessibility';

export default {
  lead: '브라우저가 하는 일에는 손대지 않고, 브라우저가 하지 않는 일은 전부 한다. gassan의 접근성은 이 두 축으로 이루어져 있다.',
  native: {
    title: '브라우저에 맡기는 것',
    intro: 'showModal()이 담당한다. 직접 만들면 반드시 어딘가 빠지므로, 쓰지 않는 것이 정답.',
    tableCaption: '네이티브에 위임하는 항목',
    callout:
      '`aria-modal`도 붙이지 않는다. `showModal()`의 top layer와 inert가 같거나 그 이상의 효과를 가지며, 이중으로 지정하면 일부 스크린 리더에서 동작이 불안정해진다(A-03).',
  },
  name: {
    title: '이름은 잘리지 않는다',
    body: [
      '다이얼로그의 이름은 `<h2>` 안쪽의 `<span>`을 `aria-labelledby`로 가리킨다. 긴 제목의 생략은 CSS의 `line-clamp`로만 하고, DOM의 문자열은 자르지 않는다. 그래서 화면에서는 두 줄에서 잘려 있어도 읽어 주는 이름은 항상 완전하다.',
    ],
    mockLong: '3분기 도호쿠 지역 매장별 매출 보고서의 공유 설정 변경',
    mockToggle: '전체 보기',
    mockCut: '3분기 도호쿠 지역 매장별 매출…',
    mockTooltip: 'title 속성의 툴팁',
    do: 'CSS로 생략하고, 넘칠 때만 명시적인 토글을 보여 준다. 토글의 문구는 이름의 span 밖에 둔다(T-03 / T-08).',
    dont: "`title.slice(0, 30) + '…'`처럼 JS로 자르지 않는다. 이름째 잘린다. 나머지를 `title` 속성으로 빼는 것도, 터치에서는 나타나지 않아 WCAG 1.4.13을 충족하지 못한다(T-05).",
  },
  gate: {
    title: '누를 수 없는 이유를, 눌러서 들을 수 있다',
    body: [
      '조건을 충족할 때까지 누를 수 없는 버튼에 `disabled`는 쓰지 않는다. `disabled`는 포커스를 받지 않으므로, 키보드나 스크린 리더 사용자는 왜 진행할 수 없는지 확인할 수단 자체를 잃는다. gassan은 `aria-disabled="true"`로 하고, 눌리면 이유를 읽어 주고 막힌 곳으로 데려간다.',
    ],
    mockTitle: '이용약관 업데이트',
    mockButton: '동의하고 계속하기',
    mockNote: '동의에 체크해 주세요',
    do: '`aria-disabled` + 항상 보이는 이유 + 눌렀을 때의 읽어 주기와 안내(G-01 / G-07 / G-08). 겉모습은 전용 토큰으로 4.5:1을 유지한다(G-10).',
    dont: '`disabled`와 `opacity: .4`로 끝내지 않는다. 이유를 알 수 없고 글자도 읽을 수 없다.',
  },
  read: {
    title: '완독은 논리합으로 판정한다',
    intro:
      '스크롤 위치만으로 “읽었다”고 판정하면, 가상 커서로 읽는 사용자는 scroll 이벤트를 일으키지 않으므로 영원히 앞으로 나아갈 수 없다.',
    signals: [
      { who: '마우스·터치·휠', signal: '본문 끝의 센티널이 화면에 들어왔다' },
      { who: '키보드·스크린 리더', signal: '끝의 마커(“본문의 끝입니다”)에 포커스가 닿았다' },
      { who: '큰 화면·짧은 본문', signal: '애초에 스크롤이 필요 없는 높이였다(측정할 수 있을 때만 판정한다)' },
    ],
    chips: '완독 게이트의 명세',
  },
  focus: {
    title: '포커스를 둘 곳',
    mockTitle: '멤버 초대',
    mockButton: '초대하기',
    do: '열린 직후의 포커스는 패널 자체(K-03). 스크린 리더는 제목부터 차례로 읽기 시작할 수 있다.',
    dont: '터치 기기에서 첫 입력란에 포커스하지 않는다. 가상 키보드가 튀어 올라 본문을 가린다(K-04). × 버튼에 두는 것도 본문을 건너뛰게 하므로 피한다.',
  },
  tables: {
    title: '키보드와 보조 기술 항목',
    keyboardCaption: '키보드/포커스 항목',
    assistiveCaption: '보조 기술 항목',
  },
  preferences: {
    title: '사용자의 설정을 따른다',
    tableCaption: 'OS와 브라우저 설정을 따르는 항목',
  },
} satisfies typeof ja;
