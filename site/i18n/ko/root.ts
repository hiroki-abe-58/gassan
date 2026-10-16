import type ja from '../ja/root';

export default {
  lead: '레이어 1~3을 맡는 컨테이너. <dialog>와 showModal()에 top layer·포커스·Esc를 맡기고, 스크림·패널·라이브 리전을 두며, 닫기 요청을 이유와 함께 하나의 경로로 모은다.',
  playground: {
    title: 'kind로 정해지는 것',
    intro: 'kind·size·placement·scrim을 바꿔서 연다. 닫히지 않는 설정일 때 Esc나 배경을 누르면 흔들리며 이유를 읽어 준다.',
    exampleTitle: 'Modal.Root 플레이그라운드',
  },
  reasons: {
    title: '닫기 이유',
    intro: 'onOpenChange(false, reason)은 반드시 이유를 동반한다. “Esc로 닫았을 때만 초안을 저장한다” 같은 분기를 쓸 수 있다.',
    tableLabel: '닫기 이유 목록',
    tableCaption: 'CloseReason 8종',
    from: '발생 원인',
    refuse: '거부할 수 있는 경로',
    rows: {
      esc: { from: 'Esc 키. 네이티브 cancel을 반드시 막고 여기로 합류시킨다', refuse: 'dismiss.esc / onRequestClose' },
      backdrop: { from: '스크림 누름. 누른 지점과 뗀 지점이 모두 스크림 위일 때만', refuse: 'dismiss.backdrop / onRequestClose' },
      'close-button': { from: 'Modal.Close, 또는 closeOnClick="close-button"인 버튼', refuse: 'onRequestClose' },
      'back-button': { from: 'closeOnBack일 때의 브라우저 뒤로 가기(맨 앞의 한 장만 응답)', refuse: 'onRequestClose' },
      submit: { from: 'closeOnClick="submit"인 버튼, 또는 <form method="dialog">', refuse: 'onRequestClose(버튼을 거칠 때)' },
      programmatic: { from: '외부에서 dialog.close()가 호출되었다', refuse: '—(이미 닫혀 있다. 뒷정리만 한다)' },
      swipe: { from: '시트를 아래로 플릭(swipeToDismiss)', refuse: 'dismiss.backdrop / onRequestClose' },
      'route-change': { from: 'routeKey가 바뀌었다(Next.js라면 usePathname()을 넘긴다)', refuse: 'onRequestClose' },
    },
  },
  guard: {
    title: '붙잡기',
    intro: 'onRequestClose가 false(또는 false로 해결되는 Promise)를 반환하면 닫히지 않는다. 거부할 때는 침묵하지 않고, 흔들어서 이유를 읽어 준다.',
    exampleTitle: '작성 중인 폼 붙잡기',
    exampleDescription: '무언가 입력한 뒤 Esc나 ×를 누른다. 확인 창이 한 장 더 위에 겹친다.',
  },
  mount: {
    title: '항상 마운트와 뒷정리',
    body: [
      '모달은 항상 렌더링해 두고 `open`으로 열고 닫는다. 닫기 요청을 받으면 `data-exiting`을 붙여 퇴장을 그리고, `--g-dur-out`만큼 기다린 뒤 `close()`한다. 내용 초기화(`resetOnClose`)·포커스 복귀·스크롤 잠금 해제·`onExited`는 모두 `close()` 이후에 한다.',
    ],
    callout:
      '중첩도 할 수 있다(L-11). 안쪽의 Esc나 Cmd/Ctrl + Enter가 바깥까지 닿지 않도록, 이벤트는 “가장 가까운 dialog가 자신일 때만” 통과시킨다. 두 장을 겹쳐도 스크림은 한 장 분량의 농도 그대로다(L-12).',
  },
  a11yBody: [
    '포커스 가두기·배경의 inert 처리·Esc·포커스 복귀는 `showModal()`이 한다. Root가 직접 갖는 것은 이름 연결, 라이브 리전 하나, 초기 포커스의 위치, 닫기 경로의 일원화다.',
  ],
  a11yCaption: 'Modal.Root가 충족하는 명세',
} satisfies typeof ja;
