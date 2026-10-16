import type ja from '../ja/header';

export default {
  lead: '헤더는 grid의 첫 번째 행에 고정된다. 컨트롤은 “뒤로·현재 위치·닫기”의 3개 슬롯이며, 제목과는 다른 행에 둔다.',
  slots: {
    title: '3개의 슬롯',
    intro: 'start에 뒤로, center에 현재 위치, end에 닫기. 뒤로 버튼의 유무로 가운데가 밀리지 않도록 격자는 1fr auto 1fr.',
    exampleTitle: '주문 절차(3단계)',
    exampleDescription: '“다음”으로 진행하면 왼쪽에 뒤로 버튼이 나타난다. 가운데의 “1 / 3”은 위치가 바뀌지 않는다.',
  },
  titleRow: {
    title: '제목은 컨트롤 행에 두지 않는다',
    mockTitle: '주문 절차 — 결제 수단 선택',
    do: '컨트롤과 제목은 다른 행. 제목이 길어져도 뒤로·닫기 버튼과 부딪치지 않는다(H-05).',
    mockCrowded: '주문 절차 — 결제 수단…',
    dont: '제목을 뒤로와 닫기 사이에 끼우지 않는다. 긴 제목이면 반드시 간섭하고, 잘못 누르기 쉬운 거리도 줄어든다.',
  },
  indicator: {
    title: '현재 위치 읽어 주기',
    body: [
      '`Modal.Indicator`의 “2 / 3”은 보이기 위한 것이라, 그대로 읽으면 “2 슬래시 3”이 된다. 시각용은 `aria-hidden`으로 하고, 읽기용으로 “3단계 중 2단계”를 따로 둔다. 단계가 바뀌면 알린다(H-06).',
      '아이콘만 있는 버튼에는 “뒤로”, “닫기”라는 이름이 붙는다(A-07). 문구는 `GassanProvider`로 바꿀 수 있다.',
    ],
  },
  a11yCaption: '헤더와 컨트롤이 충족하는 명세',
} satisfies typeof ja;
