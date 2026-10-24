import type ja from '../ja/uiCharts';

export default {
  lead: '매출 추이·요금제별 가입·사용률 같은 수를 그대로 그릴 수 있는 그래프. 의존 라이브러리를 추가하지 않고 SVG와 HTML로 그리며, 키로 점을 따라가며 값을 읽어 줄 수 있다. 색은 테마를 따른다.',
  line: {
    title: '꺾은선과 영역',
    intro: '시간에 따라 변하는 수에 쓴다. 계열은 범례에서 보이거나 숨길 수 있고, 점에 포인터를 올리거나 키로 따라가면 그 달의 값을 한데 모아 보여 준다.',
    exampleTitle: '월별 매출과 비용',
    exampleDescription: 'area로 선 아래를 칠한다. table을 붙이면 아래의 “원본 데이터 보기”로 표를 열 수 있다.',
  },
  bar: {
    title: '막대',
    intro: '항목끼리 비교할 때 쓴다. 계열을 나란히 놓을지 쌓을지 고를 수 있고, 음수 값은 0의 선에서 반대쪽으로 뻗는다.',
    stackedTitle: '요금제별 신규 가입',
    stackedDescription: 'stacked로 쌓는다. 끝을 둥글게 하는 것은 0에서 가장 먼 조각뿐이다.',
    horizontalTitle: '기능별 사용 횟수',
    horizontalDescription: 'layout="horizontal"로 가로 막대로 만든다. 이름이 긴 항목에 알맞다.',
  },
  widgets: {
    title: '카드에 두는 작은 그래프',
    intro: '대시보드 카드에 두는 4가지. 작은 추이(Sparkline)·미터(Gauge)·도넛(DonutChart)·순위 막대(BarList).',
    exampleTitle: '대시보드 카드',
    exampleDescription: '도넛은 조각이나 범례에 포인터를 올리면 가운데에 그 값과 비율을 보여 준다. 미터는 role="meter"로 값을 읽게 한다.',
  },
  choose: {
    title: '고르는 법',
    intro: '무엇을 보여 주고 싶은지로 고른다. 망설여지면 막대로 한다. 길이는 각도나 면적보다 정확하게 읽힌다.',
    tableCaption: '그래프 고르는 법',
    head: { chart: '컴포넌트', when: '알맞은 수', avoid: '알맞지 않은 수' },
    rows: [
      { chart: 'LineChart', when: '시간에 따라 변하는 수(매출 추이·이용자 수)', avoid: '늘어선 순서에 의미가 없는 항목' },
      { chart: 'LineChart(area)', when: '양의 추이와 그 내역(stacked)', avoid: '계열이 4개를 넘는 비교' },
      { chart: 'BarChart', when: '항목끼리의 비교·내역(stacked)·증감(음수 값)', avoid: '점이 많은 추이(90일 등)' },
      { chart: 'DonutChart', when: '전체에 대한 비율(항목은 5개까지)', avoid: '크기가 비슷한 항목끼리의 비교' },
      { chart: 'Sparkline', when: '표나 카드에 곁들이는 흐름', avoid: '값을 정확하게 읽게 하고 싶을 때' },
      { chart: 'BarList', when: '순위(많이 본 페이지·유입 경로)', avoid: '시간에 따른 추이' },
      { chart: 'Gauge', when: '상한이 있는 하나의 양(사용률·달성률)', avoid: '상한이 없는 양' },
    ],
  },
  access: {
    title: '스크린 리더와 키보드',
    intro: '그래프는 이름(label)과 주된 경향을 나타내는 문장(description)을 갖는다. Tab은 점 가운데 하나에만 멈추고, 화살표 키로 옆 점으로 옮기면 항목과 계열의 값을 한데 모아 읽어 준다. 툴팁은 같은 값을 눈에 보여 줄 뿐이므로 읽어 주지 않는다.',
    tableCaption: '그래프의 키 조작',
    head: { key: '키', action: '동작' },
    rows: [
      { key: 'Tab', action: '그래프의 점으로 들어간다(전에 머물렀던 점 또는 첫 점). 한 번 더 누르면 다음 요소로' },
      { key: '→ / ↓', action: '다음 점으로. 끝에서 멈춘다' },
      { key: '← / ↑', action: '이전 점으로' },
      { key: 'Home / End', action: '첫 점·마지막 점으로' },
      { key: 'Enter / Space(범례)', action: '계열을 숨기거나 되돌린다. 마지막 하나는 숨기지 않는다' },
    ],
  },
  colors: {
    title: '색',
    intro: '계열은 --g-chart-1부터 차례로 칠한다. 1은 강조색을 따르고, 2~8은 색조를 서로 떨어뜨린 고정 색이며, 모두 표면에 대해 3:1 이상이다. 색만으로 계열을 전하지 않도록 범례와 툴팁과 읽어 주는 내용에 이름을 곁들인다.',
    listLabel: '계열의 색',
  },
  codeCaption: '사용법',
  code: "import { LineChart } from '@genelab/gassan';\n\nconst rows = [\n  { month: '1월', revenue: 1180000, cost: 820000 },\n  { month: '2월', revenue: 1240000, cost: 850000 },\n  { month: '3월', revenue: 1520000, cost: 900000 },\n];\n\n<LineChart\n  label=\"월별 매출과 비용\"\n  description=\"매출은 3월이 최대\"\n  data={rows}\n  x=\"month\"\n  series={[\n    { key: 'revenue', label: '매출' },\n    { key: 'cost', label: '비용' },\n  ]}\n  valueFormat={{ style: 'currency', currency: 'JPY' }}\n  area\n/>",
  a11yCaption: '그래프의 동작',
} satisfies typeof ja;
