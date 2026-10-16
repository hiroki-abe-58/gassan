import type ja from '../ja/layout';

export default {
  lead: '너비는 토큰으로, 높이는 CSS Grid와 dvh로 정한다. JS로 높이를 계산하지 않는다. 스크롤하는 것은 본문뿐이다.',
  size: {
    title: '너비 토큰',
    intro: '패널의 너비는 min(100%, 토큰). 좁은 화면에서는 넘치지 않고, 넓은 화면에서는 읽기 쉬운 줄 길이에 들어간다.',
  },
  placement: {
    title: '배치',
    intro: 'placement="auto"는 JS로 center 또는 sheet로 결정한 뒤 DOM에 넘긴다.',
    mockTitle: '경로',
    when: {
      center: '데스크톱의 기본값',
      top: '내용의 높이가 크게 바뀔 때. 가운데 정렬이면 높이 변화에 따라 위아래로 날뛴다',
      sheet: '너비 600px 미만의 기본값. 한 손으로 닿는 곳에 primary를 둘 수 있다',
    },
  },
  grid: {
    title: '패널의 격자',
    intro: '헤더·본문·푸터 3행. 본문 행이 minmax(0, 1fr)이 아니면 본문이 줄어들지 않아 스크롤되지 않는다.',
    code: '.g-panel {\n  inline-size: min(100%, var(--g-panel-max));\n  max-block-size: 100%;           /* 100vh는 쓰지 않는다 */\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n}\n.g-header { grid-row: 1; }\n.g-body   { grid-row: 2; overflow: auto; overscroll-behavior: contain; }\n.g-footer { grid-row: 3; }',
    codeCaption: '개념(실제 규칙은 src/styles.css)',
    mockTitle: '업데이트 내역',
    mockClose: '닫기',
    do: '스크롤하는 것은 본문뿐. 헤더와 푸터는 항상 보인다(B-01 / H-10).',
    mockCut: '제목이 화면 위로 잘려 있다',
    dont: '`max-h-[90vh]`나 `1fr` 단독으로 끝내지 않는다. 모바일의 주소 표시줄 때문에 높이가 무너지고, 가운데 정렬로 위쪽 끝이 잘린다.',
  },
  touch: {
    title: '터치할 수 있는 크기',
    body: (tap: string): string =>
      `버튼과 아이콘 버튼의 터치 영역은 \`${tap}\`. WCAG 2.5.8의 최소는 24px이지만 Apple HIG의 44px을 채택한다. “뒤로”와 “×” 사이는 8px 이상 띄운다. 이 둘을 잘못 누르는 것이 가장 비싼 사고이기 때문이다(H-03 / H-04).`,
    callout: '세이프 에어리어는 반드시 `max()`로 감싼다. `env(safe-area-inset-bottom)`이 0인 기기에서 여백이 사라지지 않도록(C-04 / F-12).',
  },
  spec: {
    title: '컨테이너 항목',
    tableCaption: '컨테이너 명세',
  },
} satisfies typeof ja;
