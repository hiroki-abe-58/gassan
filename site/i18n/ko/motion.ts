import type ja from '../ja/motion';

export default {
  lead: '등장도 퇴장도 CSS만으로 그린다. JS 애니메이션 라이브러리는 쓰지 않는다. JS가 맡는 것은 “퇴장이 보일 때까지 close()를 기다리는” 것뿐.',
  durations: {
    title: '시간',
    intro: '퇴장은 등장보다 빠르게. 사람은 “열리기”는 기다릴 수 있어도 “닫히기”는 기다리지 못한다.',
    in: '등장',
    out: '퇴장',
    replayClose: '닫기(120ms)',
    replayOpen: '열기(180ms)',
  },
  easing: {
    title: '이징',
    in: '등장(감속하며 멈춘다)',
    out: '퇴장(가속하며 떠난다)',
  },
  exit: {
    title: '퇴장 애니메이션과 overlay',
    body: [
      'CSS로 퇴장을 그리는 핵심은 `transition-behavior: allow-discrete`와 `overlay` 두 가지다. 다만 `overlay`는 아직 Baseline이 아니다. 지원하지 않는 브라우저에서는 `close()`하는 순간 top layer에서 빠져 사라진다.',
      '그래서 gassan은 닫기 요청을 받으면 `close()`를 호출하지 않고 `data-exiting`을 붙여, dialog를 연 채로 퇴장 상태로 전환한다. `--g-dur-out`만큼 기다린 뒤 `close()`한다. 대기 시간은 CSS 토큰에서 읽으므로, JS에 같은 수치를 이중으로 두지 않는다(L-07).',
    ],
  },
  reduced: {
    title: '동작 줄이기 설정',
    callout:
      '`prefers-reduced-motion: reduce`에서는 페이드를 1ms로 한다. 0으로는 하지 않는다. 0으로 하면 discrete 전환(`display`와 `overlay`)이 깨진다(S-05). 퇴장 대기 시간도 0이 되지만, 경로는 같은 코드를 지난다.',
    tableCaption: '모션 명세',
  },
} satisfies typeof ja;
