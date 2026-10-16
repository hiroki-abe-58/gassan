import type ja from '../ja/gate';

export default {
  lead: '“끝까지 읽으면”, “체크하면”, “3개 고르면” 누를 수 있는 버튼을 disabled 없이 만든다. 누르면 무엇이 부족한지 읽어 주고, 그곳으로 데려간다.',
  consent: {
    title: '완독과 동의',
    intro: 'Modal.Body의 readGate와 Modal.Consent가 각각 이름 붙은 게이트를 등록한다. gate를 붙인 버튼은 전부 충족될 때까지 누를 수 없다.',
    exampleTitle: '이용약관 업데이트',
    exampleDescription: '읽기 전에 “동의하고 계속하기”를 눌러 본다. 이유를 읽어 주고, 본문이 한 화면만큼 넘어간다.',
  },
  custom: {
    title: '임의의 조건',
    intro: 'Modal.Gate에 satisfied와 reason을 넘기면 어떤 조건이든 게이트로 만들 수 있다. focus를 넘기면 눌렸을 때 그곳으로 데려간다.',
    exampleTitle: '3개 이상 고르기',
  },
  selector: {
    title: '버튼이 어느 게이트를 보는가',
    tableLabel: 'gate 작성법',
    tableCaption: 'gate 작성법과 등록 전 상태',
    head: { code: '작성법', before: '등록 전', meaning: '의미' },
    rows: [
      { code: 'gate / gate={true}', before: '닫힘', meaning: '등록된 모든 게이트를 본다. 등록이 다 갖춰질 때까지는 “아직 모름”' },
      { code: "gate={['terms']}", before: '닫힘', meaning: '이름으로 지정한다. 등록되지 않은 이름은 미충족으로 취급한다' },
      { code: 'gate={[]}', before: '열림', meaning: '조건이 0개로 확정되어 있다. 기다릴 이유가 없다' },
    ],
    body: [
      '게이트는 자식의 effect에서 등록된다. 서버에서는 effect가 실행되지 않고, 클라이언트에서도 첫 렌더에서는 아직 실행되지 않았다. 그 틈에 등록부는 비어 있지만, 그것은 “조건이 없다”가 아니라 “아직 모른다”이다. 그래서 `gate`를 붙인 버튼은 서버 쪽 마크업에서도 `aria-disabled="true"`로 나오고, 마운트 후에 실제 조건으로 바뀐다. 서버와 첫 렌더가 일치하므로 hydration 불일치도 일어나지 않는다(G-12).',
    ],
  },
  rules: {
    title: '게이트로 삼으면 안 되는 조건',
    callout:
      '“N초 기다리면 누를 수 있음”은 만들지 않는다(WCAG 2.2.1). “스크롤 위치가 끝에 오면”만으로 판정하지 않는다(가상 커서 사용자가 영원히 나아갈 수 없다). 누를 수 없는 상태를 만들어도 되는 것은 폼의 유효성·명시적 동의·법적으로 필요한 완독뿐이다.',
    codeCaption: '눌렸을 때 일어나는 일',
    code: '// 1. 이유를 role="status"인 라이브 리전으로 읽어 준다(G-07)\n// 2. 막힌 곳으로 데려간다(G-08)\n//    읽지 않았다면 본문을 한 화면만큼 넘긴다. 끝까지 한 번에 넘기지 않는다(게이트의 의미가 사라진다)\n//    체크하지 않았다면 체크박스로 포커스\n// 3. onClick은 호출하지 않는다',
  },
  a11yCaption: '활성화 게이트의 명세',
} satisfies typeof ja;
