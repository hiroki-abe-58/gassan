import type ja from '../ja/uiChat';

export default {
  lead: '사람끼리의 채팅에도, AI와의 대화에도 쓰는 컴포넌트. 메시지 목록·입력란·입력 중 표시·질문 예시. 위쪽을 읽는 동안에는 위치를 움직이지 않고, 일본어 변환 중의 Enter를 보내기로 착각하지 않는다.',
  team: {
    title: '팀 채팅',
    intro: '내 메시지는 오른쪽에 강조색으로, 상대의 메시지는 왼쪽에 놓는다. 같은 사람이 이어서 보낸 메시지는 아바타와 이름을 되풀이하지 않는다.',
    exampleTitle: '김민준 님과의 대화',
    exampleDescription: '보내면 “보내는 중”에서 “읽음”으로 바뀌고, 입력 중 표시 뒤에 답장이 도착한다. 위로 스크롤하는 동안 도착하면 “새 메시지” 버튼으로 알린다.',
  },
  assistant: {
    title: 'AI와의 대화',
    intro: 'AI의 답변은 말풍선에 넣지 않고, 본문으로 폭 가득히 보여 준다. 질문 예시로 시작할 수 있고, 답변을 쓰는 동안에는 멈출 수 있다.',
    exampleTitle: 'AI 어시스턴트',
    exampleDescription: '질문 예시를 누르면 답변을 스트리밍하며 써 내려간다. 쓰는 동안에는 보내기 버튼이 “멈추기”가 된다. 답변은 다 쓴 뒤에 읽어 준다.',
  },
  widget: {
    title: '사이트 오른쪽 아래의 챗봇',
    intro: 'ChatWidget은 화면 오른쪽 아래에 둥근 플로팅 버튼을 두고, 누르면 오른쪽 아래에 작은 창을 연다. 작은 창은 모달이 아니므로, 페이지를 읽으면서 대화할 수 있다. 헤더의 버튼으로 오른쪽 패널(모달)로 넓힐 수 있고, 스마트폰 폭에서는 화면을 가득 채우는 시트가 된다. 안의 내용은 위의 ChatThread와 ChatComposer를 그대로 쓴다.',
    exampleTitle: 'AI 어시스턴트 챗봇',
    exampleDescription: '버튼을 누르면 이 페이지의 오른쪽 아래에 플로팅 버튼과 인사말이 나타난다. 플로팅 버튼을 누르고 질문 예시를 고르면, 답변을 스트리밍하며 써 내려간다. “오른쪽으로 넓히기”와 “작게 하기”는 헤더 오른쪽의 버튼이다.',
    tableCaption: '챗봇을 여는 법과 닫는 법',
    head: { when: '상황', then: '어떻게 되는가' },
    rows: [
      { when: '플로팅 버튼을 누름', then: '오른쪽 아래의 작은 창이 열리고, 입력란으로 포커스가 옮겨진다. 플로팅 버튼의 이름은 “채팅 닫기”가 된다' },
      { when: '읽지 않은 메시지가 있음', then: '플로팅 버튼에 숫자 배지를 표시하고, 이름을 “채팅 열기 읽지 않음 3개”로 한다(숫자 배지는 장식)' },
      { when: 'Esc나 “채팅 닫기”를 누름', then: '닫고, 플로팅 버튼으로 포커스를 되돌린다(안의 목록이나 메뉴가 Esc를 이미 처리했을 때와, 변환 중의 Esc로는 닫지 않는다)' },
      { when: '“오른쪽으로 넓히기”를 누름', then: '오른쪽 패널(모달)로 옮긴다. 뒤의 페이지는 조작할 수 없게 되고, 닫으면 플로팅 버튼으로 돌아간다' },
      { when: '스마트폰 폭', then: '화면을 가득 채우는 시트로 한다(작은 창에서는 입력란과 화면 키보드가 겹친다)' },
      { when: '인사말', then: '닫혀 있는 동안에만 플로팅 버튼 옆에 보여 준다. 누르면 열리고, ×로 사라진다(읽어 주기가 끼어들지 않는다)' },
    ],
  },
  behavior: {
    title: '계속 읽을 수 있게 하는 규칙',
    intro: '채팅은 읽는 도중에 내용이 늘어 간다. 읽는 사람의 위치와 읽어 주기를 지키기 위해 다음과 같이 동작한다.',
    tableCaption: '채팅 컴포넌트의 규칙',
    head: { when: '상황', then: '어떻게 하는가' },
    rows: [
      { when: '새 메시지가 도착함', then: '맨 아래를 보고 있으면 따라간다. 위쪽을 읽고 있으면 위치를 움직이지 않고, “새 메시지 3개” 버튼으로 알린다' },
      { when: '이전 메시지를 불러옴', then: '읽던 곳을 유지한다(위에 추가해도 보고 있는 줄은 움직이지 않는다)' },
      { when: '일본어를 변환하고 있음', then: '변환 중의 Enter는 확정에 쓰고, 보내지 않는다' },
      { when: '터치 기기에서 입력하고 있음', then: 'Enter는 줄바꿈으로 한다(화면 키보드에는 Shift 키가 없다). 보내기는 보내기 버튼으로 하고, 키 안내도 보여 주지 않는다' },
      { when: 'AI가 답변을 쓰고 있음', then: 'aria-busy로 하고, 다 쓴 뒤에 읽어 준다. 보내기 버튼은 “멈추기”가 된다' },
      { when: '상대가 입력하고 있음', then: '“김민준 님이 입력 중”이라고 말로 전하고, 목록 밖에 둔다(나타나고 사라질 때마다 읽어 주지 않는다)' },
    ],
  },
  access: {
    title: '스크린 리더와 키보드',
    intro: '목록은 role="log"이며, 추가된 메시지를 읽어 준다. 메시지는 “이름 시각”을 이름으로 갖는 article이고, 시각은 time 요소다.',
    tableCaption: '채팅 컴포넌트의 키 조작',
    head: { key: '키', action: '동작' },
    rows: [
      { key: 'Tab', action: '목록 → 입력란 → 보내기 버튼의 순서로 멈춘다. 목록에서는 ↑↓로 스크롤할 수 있다' },
      { key: 'Enter', action: '보낸다(빈 글은 보내지 않는다)' },
      { key: 'Shift+Enter', action: '줄을 바꾼다' },
      { key: 'Ctrl+Enter / ⌘+Enter', action: 'sendOn="mod+enter"일 때 보낸다(Enter는 줄바꿈)' },
    ],
  },
  codeCaption: '사용법',
  code: "import { ChatComposer, ChatThread } from '@genelab/gassan';\n\n<ChatThread\n  label=\"김민준 님과의 대화\"\n  messages={messages}\n  currentUserId={me.id}\n  unreadFrom={firstUnreadId}\n  typing={typingUsers}\n/>\n<ChatComposer onSend={(text) => send(text)} placeholder=\"메시지 입력\" />",
  a11yCaption: '채팅 컴포넌트의 동작',
} satisfies typeof ja;
