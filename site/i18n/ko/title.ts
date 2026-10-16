import type ja from '../ja/title';

export default {
  lead: '다이얼로그의 이름과 설명. 이름은 h2 안쪽의 span으로, 설명은 aria-describedby로 자동 연결된다. 생략은 CSS로만 하며, 이름은 잘리지 않는다.',
  clamp: {
    title: '긴 제목',
    intro: '기본값은 두 줄에서 생략. 넘칠 때만 “전체 보기” 토글이 나타난다.',
    exampleTitle: '긴 제목의 생략',
    exampleDescription: '생략되어 있어도 스크린 리더는 전체를 읽는다.',
  },
  why: {
    title: '왜 CSS로만 생략하는가',
    body: [
      '문자열을 JS로 자르면 DOM의 텍스트 자체가 잘린다. `aria-labelledby`가 가리키는 이름도 함께 잘려, 스크린 리더 사용자는 “3분기 도호쿠 지역 매장별 매출…”이라는 다이얼로그에 들어가게 된다. `line-clamp`는 보이는 것만 자르므로, 이름은 항상 완전한 채로 남는다.',
    ],
    mockLong: '3분기 도호쿠 지역 매장별 매출 보고서의 공유 설정 변경',
    mockToggle: '전체 보기',
    mockCut: '3분기 도호쿠 지역 매장별 매출…',
    mockTooltip: '길게 누르면 전체 표시',
    do: '눌러서 여는 명시적인 버튼으로 전체를 보여 준다. `aria-expanded`와 `aria-controls`를 가진다(T-08).',
    dont: 'hover·`title` 속성·길게 누르기에 의존하지 않는다. 터치에서 나타나지 않고, OS의 컨텍스트 메뉴와도 충돌한다(T-05 / T-06).',
  },
  a11yCaption: '제목과 설명이 충족하는 명세',
} satisfies typeof ja;
