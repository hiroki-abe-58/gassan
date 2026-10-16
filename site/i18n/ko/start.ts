import type ja from '../ja/start';

export default {
  lead: '설치하고, kind를 하나 고르고, 항상 마운트한다. 기억할 것은 그것뿐이고, 나머지 규칙은 kind가 맡는다.',
  install: {
    title: '설치',
    body: ['npm에 공개되어 있다(`@genelab/gassan`). peer는 React 18.2 이상(19에서도 동작한다).'],
    nextjs:
      'Next.js App Router에서는 배포물 맨 앞에 `"use client"`가 들어 있다. 그대로 import하면 된다. 페이지 이동 시 닫고 싶다면 `routeKey={usePathname()}`를 넘긴다(L-13).',
  },
  minimal: {
    title: '최소 예제',
    intro: '헤더·본문·푸터 3행. 이름은 Modal.Title이, 레이블과 설명의 연결은 Modal.Field가 맡는다.',
    exampleTitle: '프로필 편집',
  },
  alwaysMounted: {
    title: '모달은 항상 마운트한다',
    body: [
      '닫기 애니메이션은 “닫힌 뒤에도 요소가 남아 있다”는 것을 전제로 한다. 조건부로 마운트하면 `open`이 false가 되는 순간 요소째 사라지므로, 퇴장을 그릴 대상이 원리적으로 존재하지 않는다.',
    ],
    do: '항상 마운트하고 `open`으로 열고 닫는다. 퇴장 애니메이션·포커스 복귀·내용 초기화는 라이브러리가 순서대로 처리한다.',
    dont: '`{open && <Modal.Root />}`라고 쓰지 않는다. 닫는 순간 사라져서 퇴장 애니메이션을 그릴 수 없다(§5의 3).',
  },
  choose: {
    title: 'kind를 하나 고른다',
    body: [
      '`kind`는 `confirm` / `form` / `view` / `consent` / `flow` 다섯 가지. 정하면 스크림, Esc와 배경 클릭으로 닫을 수 있는지, 배치의 기본값이 정해진다. 여러 유형에 해당한다면 그것은 나눠야 할 두 개의 모달이다.',
    ],
    doTitle: '초안을 삭제할까요?',
    doCancel: '취소',
    doDelete: '삭제하기',
    do: '모달 하나에 목적 하나. 확인이라면 확인만 한다.',
    dontTitle: '삭제할까요? 그리고 설정도',
    dontSave: '저장하고 삭제',
    dont: '확인과 폼을 한 장에 섞지 않는다. 올바른 닫기 방식이 두 개가 되어, 어느 한쪽은 반드시 기대를 저버린다.',
    more: '5가지 유형과 의사 결정 매트릭스 →',
  },
  imperative: {
    title: '확인만이라면 await로 쓸 수 있다',
    body: [
      '확인 다이얼로그를 선언적으로 쓰면 state가 늘어난다. `useModals().confirm()`은 결과를 Promise로 반환한다. 앱의 루트에 `<ModalHost />`를 하나만 둔다.',
    ],
    code: "const modals = useModals();\nconst ok = await modals.confirm({ title: '삭제할까요?', tone: 'danger' });",
  },
  browsers: {
    title: '브라우저 요구 사항',
    intro:
      '레이어 1을 브라우저에 맡기는 이상, 브라우저의 현황이 그대로 전제가 된다. 오래된 환경에서는 “애니메이션 없는 모달”로 격하될 뿐, 열기·닫기와 접근성은 유지된다.',
    tableCaption: '사용하는 플랫폼 기능과 지원 현황',
  },
  ai: {
    title: 'AI에게 작성시킬 때',
    intro:
      'Cursor / Claude Code / Copilot에는 명세서 §9의 이 블록만 넘긴다. 2022년 이전 구현의 버릇(자체 포커스 트랩, z-index: 9999, 조건부 마운트)을 미리 막는다.',
  },
} satisfies typeof ja;
