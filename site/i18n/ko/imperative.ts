import type ja from '../ja/imperative';

export default {
  lead: '확인 다이얼로그를 선언적으로 쓰면 open state와 결과 전달 때문에 줄 수가 불어난다. useModals().confirm()은 결과를 Promise로 반환한다.',
  confirm: {
    title: 'await로 받는다',
    intro: '동시에 두 개를 호출해도 한 장씩 차례로 나온다. 두 장이 겹치면 사용자는 어느 쪽에 답하고 있는지 알 수 없게 된다.',
  },
  host: {
    title: 'ModalHost는 하나만 둔다',
    body: ['`confirm()`의 Promise는 그릴 곳이 없으면 영원히 해결되지 않는다. 그래서 출구를 3가지 보장한다(L-15).'],
    exits: [
      '호스트가 없는 채로 대기 중이면 경고한다. 판정은 1틱 늦춘다(자식의 effect는 부모보다 먼저 실행되므로, 올바른 구성이어도 동기 판정으로는 오탐이 된다).',
      '호스트가 2개 이상이면 경고한다. 같은 큐의 맨 앞을 각자 그려, 하나의 응답이 전부를 해결해 버린다.',
      '대기 중에 호스트가 사라지면 경고한다. 말없이 삼켜 버리면 “await가 돌아오지 않는다”는 것만 남고, 원인을 추적할 수 없다.',
    ],
    callout:
      '확인 내용이 단순한 동안에는 명령형 API, 게이트나 독자적인 본문이 필요하면 `Modal.Root`로 선언적으로 쓴다. `consent`를 넘기면 동의 체크가 필수인 확인이 된다.',
  },
  a11yCaption: '명령형 API가 충족하는 명세',
} satisfies typeof ja;
