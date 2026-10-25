import type ja from '../ja/common';

export default {
  siteTitle: 'gassan — SaaS를 위한 React UI 라이브러리',
  skipToMain: '본문으로 이동',
  openMenu: '메뉴 열기',
  menu: '메뉴',
  menuBody: '사이트의 페이지',
  siteNav: '사이트 탐색',
  home: '홈',
  search: '검색',
  searchPalette: '사이트 검색',
  searchPlaceholder: '페이지 이름 입력',
  spec: '명세',
  pager: '이전·다음 페이지',
  prev: '이전',
  next: '다음',
  footerCompliance: (version: string, updated: string): string => `[명세서 v${version}(${updated})](#/spec) 준수`,
  footerGenerated: '표·개수·API는 모두 명세서와 타입 정의에서 빌드 시 생성한다. 손으로 쓴 수치는 없다.',
  originalNote:
    '이 사이트의 설명은 일본어 원문을 번역한 것이다. 명세서(`modal.skill.md`)에서 가져온 문장, 즉 동작 항목의 이름과 요점, 구현 노트, API 설명, 검증 기록은 일본어 원문 그대로 싣는다.',

  lang: {
    button: '언어',
    title: '표시 언어',
  },

  theme: {
    button: '테마',
    close: '닫기',
    scheme: '모드',
    schemes: { light: '라이트', dark: '다크', system: 'OS 설정에 맞춤' },
    background: '배경',
    tints: { neutral: '무채색', soft: '옅게', strong: '진하게' },
    motion: '움직임',
    motions: { none: '없음', subtle: '절제', standard: '표준', expressive: '풍부' },
    scrollbars: '스크롤바',
    scrollbarModes: { auto: '자동', hover: '포인터', scroll: '스크롤 중', always: '항상' },
    primary: '주 색상',
    presets: {
      default: '기본',
      magenta: '마젠타',
      red: '빨간색',
      salmon: '연어색',
      vermilion: '다홍색',
      amber: '호박색',
      yellow: '노란색',
      'lime-yellow': '라임 옐로',
      lime: '연두색',
      green: '초록색',
      teal: '청록색',
      blue: '파란색',
      indigo: '남색',
      custom: '사용자 지정 색',
    },
    pickCustom: '원하는 색 고르기',
    summaryPass: (count: number, worst: string): string =>
      `글자와 채우기 ${String(count)}개 항목 모두 WCAG 기준을 충족한다(가장 빠듯한 조합도 기준의 ${worst}배)`,
    summaryFail: '기준을 충족하지 않는 조합이 있다',
    more: '선택한 색을 어떻게 조정하는지 →',
    checks: {
      linkBg: '링크·선택된 글자(페이지 배경)',
      linkSurface: '링크·선택된 글자(표면)',
      linkSurface1: '링크·선택된 글자(한 단계 가라앉은 표면)',
      linkSurface2: '링크·선택된 글자(두 단계 가라앉은 표면)',
      linkSoft: '링크(옅은 표면 위)',
      onAccent: '채워진 버튼의 글자',
      onSoft: '옅은 표면의 글자(AAA 목표)',
      ink: '본문(대비가 가장 낮은 표면)',
      ink2: '보조 글자(대비가 가장 낮은 표면)',
      ink3: '흐린 글자(대비가 가장 낮은 표면)',
      do: '“Do” 색의 글자(대비가 가장 낮은 표면)',
      dont: '“Don’t” 색의 글자(대비가 가장 낮은 표면)',
      caution: '“Caution” 색의 글자(대비가 가장 낮은 표면)',
      gassanPrimary: '모달 primary의 글자',
      gassanGated: '모달의 게이트 적용 중인 primary 글자',
      gassanBody: '모달 본문',
      gassanMuted: '모달의 보조 텍스트·tertiary',
      gassanDanger: '모달의 오류 문구',
      gassanSuccess: '토스트의 성공 아이콘',
      gassanWarning: '토스트의 주의 아이콘',
      gassanInfo: '토스트의 정보 아이콘',
      gassanSunday: '달력의 일요일·공휴일',
      gassanSaturday: '달력의 토요일',
      focusRing: '포커스 링(비텍스트)',
      fill: '스위치·선택된 칩의 채우기(비텍스트)',
    },
  },

  example: {
    show: '코드 보기',
    hide: '코드 닫기',
  },

  frame: {
    variant: '견본',
    width: '미리 보기 너비',
    wide: '데스크톱',
    phone: '스마트폰',
    open: '전체 화면으로 열기',
  },

  keyPoint: { caution: '주의' },

  component: {
    eyebrow: '컴포넌트',
    tabs: '이 페이지의 내용',
    overview: '개요',
    api: 'API',
    a11y: '접근성',
  },

  specChips: '이 페이지가 다루는 명세',

  guideline: { do: 'Do', dont: "Don't", caution: 'Caution' },

  mock: { heading: '이번 달 매출' },

  specTable: {
    id: 'ID',
    behavior: '동작',
    priority: '수준',
    summary: '구현 요점',
    status: '상태',
  },
  priority: { M: '필수', S: '권장', O: '선택' },
  status: {
    実装: '구현',
    実機: '실기기',
    記述: '서술',
    未検証: '미검증',
    委譲: '위임',
    合成: '조합',
    ロードマップ: '로드맵',
  },

  api: {
    name: '이름',
    type: '타입',
    default: '기본값',
    description: '설명',
    required: '필수',
    none: '없음',
    propsOf: (name: string): string => `${name} props`,
    passthrough:
      '`data-*`는 호스트 요소로 그대로 전달한다(D-11). `aria-*` 등 하이픈이 들어간 다른 prop은 경고하고 버린다.',
    inherits: (name: string): string => `\`${name}\`에서 상속한다.`,
  },

  table: '표',

  contrastSample: 'Aa 가',

  breakCompare: {
    browser: '브라우저 기본',
    browserNote: '글자 단위로 줄바꿈된다',
    phraseNote: '문절 경계에서 줄바꿈된다',
  },

  layers: {
    layer: (n: number): string => `레이어 ${String(n)}`,
    tokens: 'CSS 토큰',
  },

  notFound: {
    title: '페이지를 찾을 수 없다',
    lead: '링크가 오래되었거나 주소가 잘못되었다.',
    back: '홈으로 돌아가기',
  },
} satisfies typeof ja;
