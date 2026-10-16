import type ja from '../ja/body';

export default {
  lead: '모달 안에서 유일한 스크롤 영역. 키보드로도 읽을 수 있도록 포커스할 수 있고, 이름을 가진다. 완독 게이트도 여기에 붙인다.',
  scroll: {
    title: '스크롤은 본문만',
    intro: '헤더와 푸터는 고정. 본문 끝에 닿지 않은 동안에는 위아래에 그림자가 나타난다.',
    exampleTitle: '업데이트 내역',
    exampleDescription: 'Tab으로 본문에 포커스하고 화살표 키·PageDown·Space로 스크롤할 수 있다.',
  },
  focusable: {
    title: '포커스할 수 있는 스크롤 영역',
    body: [
      'Firefox 이외의 브라우저는 스크롤할 수 있는 요소를 자동으로 포커스 가능하게 만들지 않는다. 마우스가 없는 사용자는 본문에 도달하지 못한 채 읽을 수 없게 된다. gassan의 본문은 `tabIndex={0}`, `role="group"`, 그리고 접근 가능한 이름을 가진다. 이름 없는 포커스 가능 요소는 만들지 않는다(B-02 / B-03).',
    ],
    mockTitle: '업데이트 내역',
    do: '본문에 Tab으로 들어가 키로 읽을 수 있다. 이름은 “업데이트 내역 본문”처럼 label로 붙인다.',
    dont: '`<div className="overflow-y-auto">`만으로 끝내지 않는다. 키보드 사용자에게는 읽을 수 없는 영역이 된다.',
  },
  readGate: {
    title: '완독 게이트',
    body: [
      '`readGate="read"`를 넘기면 본문을 다 읽었는지가 이름 붙은 게이트로 등록된다. 판정은 “끝이 보였다”, “끝에 포커스가 닿았다”, “애초에 스크롤 불필요”의 논리합이며, 한 번 충족되면 취소하지 않는다. 닫혀 있는 동안에는 크기가 0이 되므로 판정하지 않는다(§10-1). 사용법은 [활성화 게이트](#/components/gate)에 있다.',
    ],
  },
  a11yCaption: '본문이 충족하는 명세',
} satisfies typeof ja;
