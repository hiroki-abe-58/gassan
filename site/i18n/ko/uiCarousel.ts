import type ja from '../ja/uiCarousel';

export default {
  lead: '공지사항이나 도입 사례를 옆으로 넘기며 보여 주는 컴포넌트. 손가락이나 트랙패드로는 그대로 넘길 수 있고, 이전·다음·점·자동 재생으로도 넘길 수 있다. 자동 재생할 때는 정지 버튼을 맨 앞에 두고, 포인터가 올라가 있거나 포커스가 안에 있는 동안에는 멈춘다.',
  news: {
    title: '공지사항(자동 재생)',
    intro: '한 장씩 크게 보여 준다. autoplay로 6초마다 넘기고, 마지막 장에서 첫 장으로 돌아간다. 현재 점에서 늘어나는 선이 다음 장으로 넘기기까지 남은 시간이다.',
    exampleTitle: '공지사항 캐러셀',
    exampleDescription: '왼쪽 위의 버튼으로 자동 재생을 멈출 수 있다. 포인터가 올라가 있는 동안과 포커스가 안에 있는 동안에도 멈추고, 벗어나면 멈춘 곳부터 이어서 센다.',
  },
  cases: {
    title: '도입 사례(여러 장 나란히)',
    intro: 'minSlideWidth를 넘기면 컨테이너 폭에 들어가는 만큼의 장수를 나란히 놓는다. 점은 맨 앞에 놓을 수 있는 위치의 수만큼 나온다.',
    exampleTitle: '도입 사례',
    exampleDescription: '화면 폭을 좁히면 한 장씩 보인다. 모두 보이고 있을 때는 이전·다음도 점도 나오지 않는다.',
  },
  rules: {
    title: '자동 재생이 멈출 때',
    intro: '계속 움직이는 것은 다 읽기 전에 사라져 버린다. WCAG 2.2.2에 따라 멈추는 수단과 멈추는 상황을 정해 두었다.',
    tableCaption: '자동 재생이 멈출 때',
    head: { when: '상황', then: '그 뒤' },
    rows: [
      { when: '정지 버튼을 누름', then: '시작 버튼을 누를 때까지 넘기지 않는다' },
      { when: '포인터가 올라가 있음', then: '벗어나면 멈춘 곳부터 이어서 센다' },
      { when: '포커스가 안에 있음', then: '밖으로 나가면 멈춘 곳부터 이어서 센다' },
      { when: '탭이 숨겨져 있음', then: '돌아오면 멈춘 곳부터 이어서 센다' },
      { when: '“동작 줄이기” 설정', then: '멈춘 상태로 시작한다(시작 버튼으로 움직이게 할 수 있다)' },
      { when: '마지막 슬라이드(loop={false})', then: '거기서 멈춘다' },
    ],
  },
  access: {
    title: '스크린 리더와 키보드',
    intro: '캐러셀은 이름과 “캐러셀”이라는 역할 설명을 가진 영역이고, 슬라이드는 “5개 중 1번째”(또는 label)라는 이름을 갖는다. 위치가 바뀌면 읽어 준다. 자동으로 넘기는 동안에는 읽어 주지 않는다.',
    tableCaption: '캐러셀의 키 조작',
    head: { key: '키', action: '동작' },
    rows: [
      { key: 'Tab', action: '정지 버튼 → 슬라이드 안의 링크나 버튼 → 이전 → 현재 점 → 다음의 순서로 멈춘다' },
      { key: 'Enter / Space(이전·다음)', action: '옆 슬라이드로. 끝에서는 누를 수 없다(loop라면 반대쪽 끝으로 돌아간다)' },
      { key: '← / →(점)', action: '옆 점으로 옮기고, 그 슬라이드를 맨 앞에 놓는다' },
      { key: 'Home / End(점)', action: '첫 점·마지막 점으로' },
    ],
  },
  codeCaption: '사용법',
  code: "import { Carousel } from '@genelab/gassan';\n\n<Carousel\n  label=\"공지사항\"\n  autoplay\n  items={[\n    { id: 'dashboard', label: '새로운 대시보드', content: <NewsSlide /> },\n    { id: 'invoices', label: '청구서 일괄 다운로드', content: <NewsSlide /> },\n  ]}\n/>",
  a11yCaption: '캐러셀의 동작',
} satisfies typeof ja;
