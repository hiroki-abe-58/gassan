import type ja from '../ja/chart';

export default {
  lead: '가져온 그림(외부 라이브러리, 직접 만든 SVG나 canvas)을 담는 차트 컨테이너. 그림에 이름과 경향 요약, 원본 데이터 펼치기를 연결한다. canvas만으로는 읽어 줄 정보가 전혀 없기 때문이다. gassan으로 그리려면 UI 요소의 “그래프”(LineChart 등)를 쓴다.',
  report: {
    title: '이름·요약·원본 데이터',
    intro: 'label과 summary는 필수. 그림 자체는 기본으로 aria-hidden이 되어, 요약과 원본 데이터가 유일한 경로가 된다.',
    exampleTitle: '월간 보고서',
    exampleDescription: '“원본 데이터 보기”를 펼치면 같은 수치를 표로 읽을 수 있다.',
  },
  why: {
    title: '그리는 요소와의 구분',
    body: [
      'gassan이 그리는 그래프(UI 요소의 “그래프”)는 이름, 요약, 원본 데이터 표, 키보드로 점을 따라가며 읽어 주는 기능을 스스로 갖는다. 이 컨테이너는 그 밖의 그림을 위한 것이다. 지도, 네트워크 도, 3D처럼 gassan이 그리지 않는 그림도 있고, 익숙한 그리기 라이브러리를 쓰고 싶을 때도 있다. 그림은 SVG든 canvas든 어떤 라이브러리든 상관없다. 이 컨테이너가 맡는 것은 어떤 그림에나 빠지기 쉬운 “이름”, “경향의 텍스트 대체”, “원본 데이터로의 도달” 세 가지뿐이다.',
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
