import type ja from '../ja/toast';

export default {
  lead: '처리가 끝났다는 것을 작업을 방해하지 않고 전하는 알림. `toast()`를 호출하면 화면 가장자리에 나타나고, 아래쪽 가장자리의 미터가 남은 시간에 맞춰 줄어들며, 시간이 다 되면 닫힌다. ×나 Esc, 옆으로 스와이프하는 동작으로도 닫을 수 있다. 모달이 열려 있어도 그 위에 나타나며 누를 수 있다.',
  tones: {
    title: '견본',
    intro: '아이콘과 색은 성공·정보·주의·실패의 4가지와, 아이콘이 없는 기본값이 있다. 색은 아이콘과 미터에만 입히고, 표면은 다른 컴포넌트와 같게 한다(테두리로 감싸서 강조하지 않는다).',
    exampleTitle: '톤의 차이',
    exampleDescription: '버튼을 누르면 오른쪽 아래에 나타난다. 포인터를 올려 두는 동안에는 미터가 멈춘다.',
  },
  meter: {
    title: '남은 시간 미터',
    intro: '아래쪽 가장자리의 선이 남은 시간에 비례해 줄어든다. 옅은 바탕이 전체 길이를 보여 주므로, 앞으로 얼마 뒤에 사라질지 한눈에 알 수 있다.',
    body: [
      '포인터가 올라가 있는 동안, 포커스가 안에 있는 동안, 탭이 숨겨져 있는 동안, 손가락으로 움직이는 동안에는 시간도 미터도 멈춘다. 읽는 도중에 사라지게 하지 않는다(WCAG 2.2.1 / 2.2.2). 멈추기 전의 남은 시간부터 이어서 센다.',
      '미터는 남은 시간을 전하는 정보이므로, 움직임 단계를 `none`으로 해도 멈추지 않는다. OS의 “동작 줄이기” 설정에서는 매끄럽게 줄이지 않고 1초마다 끊어서 줄인다.',
      '시간은 `duration` (ms)으로 바꿀 수 있다. `Infinity`를 넘기면 시간으로는 닫히지 않고, 미터도 표시하지 않는다.',
    ],
    tableCaption: '기본 길이',
    head: { kind: '종류', duration: '길이' },
    rows: [
      { kind: '아이콘 없음·성공·정보', duration: '5초' },
      { kind: '주의·실패', duration: '8초(다시 읽을 시간을 감안)' },
      { kind: '버튼이 달린 것', duration: '10초 이상(누르러 갈 시간을 감안)' },
      { kind: '로딩 중(toast.promise)', duration: '시간으로는 닫히지 않음' },
    ],
  },
  action: {
    title: '실행 취소',
    intro: '되돌릴 수 있는 작업 뒤에는 확인 모달로 멈춰 세우기보다, 바로 실행하고 토스트에 “실행 취소”를 붙이는 편이 빠르다. 버튼은 하나만 둘 수 있다.',
    exampleTitle: '초안 삭제하기',
    exampleDescription: '삭제는 바로 적용된다. 10초 안에 “실행 취소”를 누르면 되돌아온다.',
  },
  promise: {
    title: '처리하는 동안',
    intro: '`toast.promise`는 처리하는 동안 로딩 중 토스트를 표시하고(시간으로는 닫히지 않는다), 끝나면 같은 자리에서 성공이나 실패로 바꾼다.',
    exampleTitle: '저장하기',
    exampleDescription: '1.5초 걸리는 저장을 성공과 실패 양쪽으로 시험해 볼 수 있다.',
  },
  position: {
    title: '표시 위치',
    intro: '위아래와 왼쪽·가운데·오른쪽을 조합한 6곳. 기본값은 오른쪽 아래(오른쪽에서 왼쪽으로 쓰는 언어에서는 왼쪽 아래). 위에 표시할 때는 새것을 위에 두어, 보이는 순서와 읽기 순서를 맞춘다.',
    choose: '표시 위치',
    labels: {
      'top-start': '왼쪽 위',
      'top-center': '위',
      'top-end': '오른쪽 위',
      'bottom-start': '왼쪽 아래',
      'bottom-center': '아래',
      'bottom-end': '오른쪽 아래',
    },
    try: '표시해 보기',
    message: (place: string): string => `${place}에 표시했습니다`,
    body: [
      '동시에 보여 주는 개수는 `max` (기본값 3). 넘으면 오래된 것부터 닫는다. 닫히면 나머지가 미끄러지며 빈자리를 메운다.',
      '나타나고 사라지는 움직임은 움직임 단계의 토큰을 따른다. `expressive`에서는 가장자리에서 스프링처럼 들어오고, `none`에서는 움직이지 않고 나타났다가 사라진다.',
    ],
  },
  modal: {
    title: '모달 위',
    intro: '모달이 열려 있는 동안 모달 바깥의 요소는 누를 수 없고, 읽어 주지도 않는다(top layer에 띄워도 마찬가지). 그래서 모달이 열리면 토스트는 맨 앞의 다이얼로그 안으로 옮겨 가 그 위에 다시 표시된다.',
    exampleTitle: '모달 안에서 복사하기',
    exampleDescription: '토스트는 모달 위에 나타나며, ×로 닫을 수 있다. 토스트 위에서 Esc를 눌러도 모달은 닫히지 않는다.',
    body: ['옮겨 가도 남은 시간과 미터는 이어서 움직인다. 모달을 닫으면 원래 자리로 돌아간다.'],
  },
  keys: {
    title: '조작',
    tableCaption: '토스트 조작',
    head: { key: '조작', action: '동작' },
    rows: [
      { key: 'Tab', action: '토스트의 버튼으로 이동한다. 포커스가 안에 있는 동안에는 시간이 멈춘다' },
      { key: 'Esc', action: '포커스가 있는 토스트를 닫는다(모달은 닫지 않는다)' },
      { key: 'Enter / Space', action: '버튼(실행 취소·×)을 누른다. 닫히면 옆 토스트로, 마지막이었다면 원래 자리로 포커스를 돌려준다' },
      { key: '옆으로 스와이프', action: '스와이프한 방향으로 흘려보내며 닫는다(폭의 35%를 넘기거나, 빠르게 스와이프)' },
    ],
  },
  host: {
    title: '두는 방법',
    body: [
      '`<ToastHost />`를 앱의 루트에 하나만 둔다. `toast()`는 어디에서 호출해도 거기에 그린다. 호스트가 없는 채로 호출하면 개발 중에 경고가 나온다.',
      '알림 영역은 “알림”이라는 이름의 랜드마크이며, `aria-live="polite"`를 가진다. 영역은 토스트가 없을 때도 그대로 둔다(라이브 리전은 내용보다 먼저 있어야 확실히 읽힌다).',
    ],
  },
  apiCaption: {
    functions: 'toast의 함수',
    head: { call: '호출 방법', returns: '반환값', description: '설명' },
    rows: [
      { call: 'toast(message, options?)', returns: 'id', description: '아이콘 없는 토스트를 표시한다. options.tone으로 톤을 고를 수 있다' },
      { call: 'toast.success / info / warning / error(message, options?)', returns: 'id', description: '톤을 정해서 표시한다' },
      { call: 'toast.promise(promise, messages, options?)', returns: 'Promise', description: '처리하는 동안 로딩 중을 표시하고, 끝나면 바꾼다. 넘긴 Promise를 그대로 반환한다' },
      { call: 'toast.dismiss(id?)', returns: '—', description: '닫는다. id를 생략하면 전부' },
    ],
  },
  a11yCaption: '토스트가 충족하는 명세',
} satisfies typeof ja;
