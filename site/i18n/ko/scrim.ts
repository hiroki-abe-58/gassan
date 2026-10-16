import type ja from '../ja/scrim';

export default {
  lead: '스크림의 일은 “뒤쪽은 지금 만질 수 없다”고 전하는 것이다. 뒤쪽을 지우는 것이 아니다. 기본값은 검정 32%·blur 없음이며, 의도에 따라 4단계 중에서 고른다.',
  levels: {
    title: '4개의 단계',
    intro: '수치는 src/styles.css의 토큰에서 읽어 온다.',
    mockTitle: '초안을 삭제할까요?',
    mockDelete: '삭제하기',
    tableCaption: '스크림 토큰과 사용하는 상황',
  },
  try: {
    title: '열어서 비교하기',
    exampleTitle: 'scrim의 4단계',
    exampleDescription: '같은 패널을 각 단계의 스크림으로 연다.',
  },
  why: {
    title: '왜 60%가 아닌가',
    body: [
      '32%는 Material Design 3의 scrim 규정과 일치한다. 60~80%의 검정은 모달이 다른 수단보다 뛰어난 유일한 점인 뒤쪽의 맥락을 스스로 지워 버린다. 누구를 삭제하려는지, 어느 행의 상세를 보고 있는지 알 수 없게 된다.',
    ],
    mockTitle: '이 행을 삭제할까요?',
    mockDelete: '삭제하기',
    do: '기본값 32%. 뒤쪽 목록을 읽을 수 있으므로 무엇에 대한 작업인지 놓치지 않는다.',
    dont: '검정 60~80%를 기본값으로 하지 않는다. 맥락을 유지한다는 모달의 유일한 강점을 버리는 것이다(§5의 9).',
  },
  blur: {
    title: 'blur를 써도 되는 경우',
    intro: 'blur는 명시적 opt-in(immersive)에서만. 다음을 모두 충족하는 경우로 한정한다.',
    body: [
      'blur를 끌 때의 대안은 “불투명도를 올리는 것”이다. `prefers-reduced-transparency: reduce`에서는 gassan이 자동으로 blur를 없애고 그만큼 농도를 더한다. 흐림만 지우고 32% 그대로 두면, 투명도를 낮춘 사람에게는 아무것도 전달되지 않는다.',
    ],
  },
  dark: {
    title: '다크 테마',
    intro: '검은 스크림은 어두운 UI 위에서는 작동하지 않는다. 어두운 배경에 어두운 막을 겹쳐도 분리가 생기지 않는다.',
    mockTitle: '설정을 저장할까요?',
    mockSave: '저장',
    do: '표면을 밝게 하고 경계선을 1px 그어 분리한다(S-07).',
    dont: '스크림을 진하게 해서 분리하려 하지 않는다. 어두워질 뿐, 패널의 윤곽은 드러나지 않는다.',
  },
  spec: {
    title: '스크림 항목',
    tableCaption: '스크림 명세',
  },
} satisfies typeof ja;
