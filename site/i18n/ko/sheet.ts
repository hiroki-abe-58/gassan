import type ja from '../ja/sheet';

export default {
  lead: 'placement="sheet"는 아래에서 올라오는 패널이 된다. detents를 넘기면 peek / half / full에서 멈춘다. 핸들은 겉모습의 장식이 아니라 키보드로도 움직일 수 있는 조작 요소다.',
  detents: {
    title: '디텐트에서 멈추는 시트',
    intro: '핸들을 드래그하거나, 포커스한 뒤 ↑ ↓로 디텐트를 옮긴다. 현재 디텐트는 onDetentChange로 받을 수 있다.',
    exampleTitle: '갓산 가는 길',
    exampleDescription: '좁은 화면이라면 손가락으로, 넓은 화면이라면 키보드와 클릭으로 시험할 수 있다.',
  },
  rules: {
    title: '3가지 규칙',
    items: [
      {
        title: '빠르게 아래로 플릭해도 닫지 않는다. 한 디텐트 내린다',
        body: '디텐트가 있는 이상, 사용자는 “조금 줄이고 싶다”는 생각으로 던진다. 닫는 것은 가장 낮은 디텐트에서 더 아래로 던졌을 때뿐.',
      },
      {
        title: '핸들을 드래그 전용으로 만들지 않는다',
        body: '디텐트가 있을 때는 role="slider"가 되어, 화살표 키·Home / End·클릭으로도 디텐트를 옮길 수 있다. 드래그할 수 없는 사람의 경로를 없애지 않는다.',
      },
      {
        title: '디텐트를 지정하지 않으면 내용에 맞춘 높이',
        body: '핸들은 장식(aria-hidden)이 된다. 움직일 수 없는 것을 조작 요소로 읽게 하지 않는다.',
      },
    ],
  },
  release: {
    title: '손가락을 뗀 뒤',
    body: [
      '드래그 판정 자체보다, 손가락을 뗀 뒤 브라우저가 멋대로 일으키는 일이 더 깨지기 쉽다. 드래그 직후의 합성 click으로 디텐트가 두 번 움직이고, 패널 밖에서 손가락을 떼면 굳고, 같은 디텐트로 돌아오면 높이 지정이 사라진다. 모두 실제로 겪고, 고치고, 테스트로 고정해 두었다(§10-13〜§10-15).',
    ],
    callout:
      '목적지 판정은 `resolveDetents` / `snapToDetent`라는 순수 함수로 분리해 두었으며, 단독으로 import할 수 있다. 레이아웃이 없는 테스트 환경에서도 검증할 수 있게 하기 위해서다.',
  },
  api: {
    body: [
      '디텐트 자체는 `Modal.Root`의 `detents` / `defaultDetent` / `onDetentChange` / `swipeToDismiss`로 지정한다([Modal.Root의 API](#/components/root/api)).',
    ],
  },
  a11yCaption: '시트와 모바일의 명세',
} satisfies typeof ja;
