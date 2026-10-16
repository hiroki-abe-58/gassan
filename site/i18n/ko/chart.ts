import type ja from '../ja/chart';

export default {
  lead: '차트를 담는 컨테이너. 그리지는 않는다. 가져온 그림에 이름과 경향 요약, 원본 데이터 펼치기를 연결한다. canvas만으로는 읽어 줄 정보가 전혀 없기 때문이다.',
  report: {
    title: '이름·요약·원본 데이터',
    intro: 'label과 summary는 필수. 그림 자체는 기본으로 aria-hidden이 되어, 요약과 원본 데이터가 유일한 경로가 된다.',
    exampleTitle: '월간 보고서',
    exampleDescription: '“원본 데이터 보기”를 펼치면 같은 수치를 표로 읽을 수 있다.',
  },
  why: {
    title: '왜 그리지 않는가',
    body: [
      '그리기 라이브러리는 선택지가 많고, 용도에 따라 최적의 답이 다르다. gassan이 이를 갖는다면, 하나를 고르는 순간 나머지 사용자를 배신하게 된다. 그래서 그림은 SVG든 canvas든 어떤 라이브러리든 상관없다. gassan이 맡는 것은 어떤 그림에나 공통으로 빠지기 쉬운 “이름”, “경향의 텍스트 대체”, “원본 데이터로의 도달” 세 가지뿐이다.',
      '그림 자체를 키보드로 따라갈 수 있는 등 그것만으로 접근 가능하다면, `visualAccessible`로 `aria-hidden`을 해제할 수 있다.',
    ],
    mockTitle: '월별 매출(만 엔)',
    mockSummary: '3월이 120만 엔으로 최대. 4월 이후는 보합.',
    mockDisclosure: '원본 데이터 보기',
    do: '그림에는 이름과 경향 요약을 덧붙이고, 원본 데이터는 표로 펼칠 수 있게 한다.',
    dont: 'canvas나 SVG를 놓기만 하지 않는다. 보이지 않는 사람에게는 “아무것도 없는” 것과 같다.',
  },
  a11yCaption: 'Modal.Chart가 충족하는 명세',
} satisfies typeof ja;
