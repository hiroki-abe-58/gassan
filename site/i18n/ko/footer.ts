import type ja from '../ja/footer';

export default {
  lead: '푸터의 버튼은 3계층까지. DOM 순서 = 시각 순서 = Tab 순서로 쓰고, 이중 전송은 원리적으로 일어나지 않게 한다.',
  hierarchy: {
    title: '버튼의 계층',
    intro: 'primary·secondary·tertiary를 하나씩. 약한 순서로 쓰면 첫 tertiary만 왼쪽으로 떨어진다.',
    exampleTitle: '글 게시하기',
    exampleDescription: '“게시하기”를 연타해도 한 번만 실행된다. ⌘ / Ctrl + Enter로도 primary를 누를 수 있다.',
  },
  loading: {
    title: '처리 중',
    body: [
      '`onAction`이 Promise를 반환하면, 해결될 때까지 버튼은 처리 중이 된다. 그동안의 클릭은 무시하므로 이중 전송은 원리적으로 일어나지 않는다. 밖에서 `loading`을 넘겨도 내부의 처리 중 상태와 **논리합**으로 합친다. `loading={false}`는 “내 사정으로는 처리 중이 아니다”라는 뜻이지, “onAction 도중에도 누르게 해도 된다”는 뜻이 아니기 때문이다(F-08).',
      '처리 중의 레이블은 `opacity: 0`으로 숨기고 스피너를 겹친다. `visibility: hidden`으로 하면 이름째 사라져 “이름 없는 버튼”이 된다(F-07 / §10-4). 너비도 바뀌지 않는다.',
    ],
    callout: '`onAction`이 reject되어도 처리 중 상태는 반드시 풀린다. 누를 수 없는 채로 굳어 버리는 버튼은 만들지 않는다.',
  },
  danger: {
    title: '파괴적인 작업',
    mockTitle: '프로젝트 삭제',
    mockCancel: '취소',
    mockDelete: '삭제하기',
    do: '`variant="danger"`는 primary 위치 그대로, 색만 바꾼다.',
    dont: '파괴적인 버튼에 초기 포커스를 두지 않는다. Enter 한 번으로 돌이킬 수 없게 된다(K-05).',
  },
  a11yCaption: '푸터와 버튼이 충족하는 명세',
} satisfies typeof ja;
