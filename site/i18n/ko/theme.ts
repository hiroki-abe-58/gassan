import type ja from '../ja/theme';

export default {
  lead: '표시 모드(라이트·다크)와 주 색상을 자유롭게 바꿀 수 있다. 어떤 색을 골라도 글자와 채우기가 WCAG 기준을 밑돌지 않도록 색을 도출한다.',
  checksTable: {
    sample: '견본',
    pair: '조합',
    ratio: '비율',
    min: '기준',
    pass: (min: number): string => `합격(${String(min)}:1 이상)`,
    fail: (min: number): string => `미달(${String(min)}:1 미만)`,
  },
  controls: {
    title: '바꾸기',
    intro: '여기서의 설정은 페이지 위쪽의 “테마”와 같다. 사이트 전체와 모달 데모에 적용된다.',
  },
  now: {
    title: '현재 테마',
    intro: '고른 색에서 도출한 4가지 색과, 그것을 쓰는 조합의 대비율. 이 표는 현재 설정으로 계산한다.',
    tones: {
      accent: '강조색(채우기·링크·포커스)',
      onAccent: '강조색 위의 글자',
      soft: '옅은 표면',
      onSoft: '옅은 표면 위의 글자',
    },
    tableCaption: '현재 테마의 대비율',
  },
  presets: {
    title: '모든 프리셋',
    intro: '시드 색과, 라이트·다크 각각에서 실제로 쓰는 색. 오른쪽 숫자는 그 테마에서 여유가 가장 작은 조합의 비율.',
    tableLabel: '프리셋 검증',
    tableCaption: '프리셋별 색과 가장 빠듯한 조합의 비율',
    preset: '프리셋',
    seed: '시드 색',
    light: '라이트',
    dark: '다크',
    current: '선택됨',
    pass: '모든 항목 합격',
    fail: '미달 있음',
    withTightest: (verdict: string, ratio: string, min: number): string =>
      `${verdict}·최소 ${ratio}:1(기준 ${String(min)}:1)`,
    body: [
      '같은 조합을 테스트에서도 전수 검사한다(`tests/theme.test.ts`). 프리셋에 더해 색조 24방향 × 명도 5단계 × 채도 4단계의 모든 임의 색에서, 라이트와 다크의 모든 항목이 기준을 충족하는지, 색조가 틀어지지 않는지, 인접한 프리셋을 구별할 수 있는지 확인한다.',
    ],
  },
  how: {
    title: '색을 정하는 방법',
    rules: [
      {
        title: '색조는 유지하고 명도만 움직인다',
        body: '선택한 색을 OKLCH(사람 눈의 지각에 가까운 색 공간)로 옮기고, 색조와 채도를 유지한 채 명도를 움직인다. RGB 그대로 어둡게 하면 색조가 틀어져 노란색이 초록이나 갈색으로 보이게 된다.',
      },
      {
        title: '모든 표면에 대해 4.5:1을 확보한다',
        body: '강조색은 링크나 선택된 글자에도 쓰이므로, 페이지 배경·표면·가라앉은 표면·옅은 표면 모두에 대해 4.5:1을 확보할 때까지 움직인다. 라이트에서는 어두운 쪽으로, 다크에서는 밝은 쪽으로. 시드에 가장 가까운 명도에서 멈춘다.',
      },
      {
        title: '글자는 라이트에서 흰색, 다크에서 어두운 색',
        body: '표면에 대해 4.5:1을 확보한 색은 라이트에서는 흰 글자에 대해서도, 다크에서는 어떤 표면보다 어두운 글자에 대해서도 반드시 4.5:1 이상이 된다. 채워진 버튼의 글자는 계산으로 보장된다.',
      },
      {
        title: '옅은 표면의 글자는 7:1을 목표로 한다',
        body: '선택된 내비게이션이나 보충 설명 박스처럼 긴 문장을 얹는 곳이므로, AA가 아니라 AAA를 목표로 한다.',
      },
    ],
    callout: (yellowHue: number, limeHue: number): string =>
      `노란색이나 연두색처럼 밝은 색조는 흰 표면 위에서 4.5:1을 확보하기 위해, 라이트에서는 겨자색이나 올리브색까지 어두워진다. 색을 고르는 자유보다 읽을 수 있음을 우선한 결과다. 다크에서는 원래의 선명함 그대로 쓸 수 있다. “노란색”과 “연두색” 사이에는 “라임 옐로”가 들어가므로, 라이트에서 어둡게 해도 이웃과 구별할 수 있도록 “연두색”을 색조 ${String(limeHue)}°까지 떨어뜨려 두었다. 색조 ${String(yellowHue)}°의 “노란색”으로 프리셋 표를 비교해 보기 바란다.`,
  },
  own: {
    title: '내 앱에서 색 바꾸기',
    intro: 'gassan 모달의 색은 커스텀 프로퍼티를 덮어쓰는 것만으로 바꿀 수 있다. @layer 밖에서 쓰면 명시도를 신경 쓰지 않아도 된다.',
    code: (accent: string, onAccent: string): string =>
      `:root {\n  --g-accent: ${accent};     /* primary의 채우기·스위치·선택된 칩 */\n  --g-on-accent: ${onAccent};  /* 그 위의 글자 */\n  --g-focus: ${accent};      /* 포커스 링 */\n}`,
    body: [
      '위의 값은 지금 고른 테마에서 도출한 것이다. 직접 색을 정할 때는 이 페이지의 표와 같은 조합(accent와 on-accent, 표면에 대한 accent와 focus)으로 비율을 확인할 것.',
    ],
  },
} satisfies typeof ja;
