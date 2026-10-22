import type ja from '../ja/color';

export default {
  lead: '모든 색은 커스텀 프로퍼티이며, 라이트와 다크 두 벌을 가진다. 어느 조합이 어떤 글자를 얹는지 정하고, 그 대비율을 테스트에서 계산한다.',
  tokens: {
    title: '색상 토큰',
    intro: 'src/styles.css의 @layer gassan.tokens에서 읽어 온다. 다크 칸이 비어 있는 것은 라이트 값을 그대로 쓴다.',
    tableCaption: '색상 토큰',
    token: '토큰',
    light: '라이트',
    dark: '다크',
  },
  contrast: {
    title: '대비율',
    intro: '아래 표는 이 페이지를 연 시점의 토큰으로 계산한다. 같은 조합과 같은 계산을 tests/tokens.test.ts가 쓰며, 기준을 밑돌면 CI가 실패한다.',
    tableCaption: { light: '라이트의 대비율', dark: '다크의 대비율' },
    sample: '견본',
    pair: '조합',
    use: '용도',
    ratio: '비율',
    min: '기준',
    uses: {
      fg: '본문',
      'fg-muted': '보조 텍스트·tertiary·게이트 적용 중인 secondary',
      'on-accent': 'primary',
      'on-accent-muted': '게이트 적용 중인 primary(G-10)',
      'on-danger': 'danger 버튼(F-06)',
      danger: '오류 문구·필수 표시',
      success: '성공 아이콘과 미터(N-02)',
      warning: '주의 아이콘과 미터(N-02)',
      info: '정보 아이콘과 미터(N-02)',
      sunday: '달력의 일요일과 공휴일(I-16)',
      saturday: '달력의 토요일(I-16)',
      focus: '포커스 링(K-07. 비텍스트는 3:1)',
    },
    pass: (min: number): string => `합격(${String(min)}:1 이상)`,
    fail: (min: number): string => `미달(${String(min)}:1 미만)`,
    callout:
      '게이트 적용 중인 primary(`--g-accent-muted`)는 한때 흰 글자로 3.16:1밖에 되지 않았다. 주석에는 “4.5:1을 유지한다”고 적혀 있었고 추적표에서도 “값은 검사 완료”라고 주장했지만, 비율 자체는 아무도 계산하지 않았다. 이 페이지에서 비율을 표시하려다가 발견되었다.',
  },
  gated: {
    title: '누를 수 없는 버튼이야말로 읽을 수 있어야 한다',
    body: [
      '`disabled` 요소는 WCAG의 대비 요건에서 제외된다. 하지만 gassan의 게이트 적용 중인 버튼은 `aria-disabled`이며, 포커스할 수 있고 누르면 이유를 돌려주는 “쓸 수 있는” 버튼이다. 제외 규정에 기댈 수 없다. 그래서 전용 토큰으로 4.5:1을 유지하고, `opacity`로 흐리게 해서 끝내지 않는다(G-10).',
      '배경용 토큰을 글자색으로 돌려 쓰지 않는 것도 정해 두었다. 다크에서는 밝은 글자를 얹는 배경과 어두운 표면에 얹히는 글자 양쪽에서 4.5:1을 확보할 수 있는 색이 존재하지 않는다.',
    ],
  },
  theme: {
    title: '나만의 색으로',
    intro: '토큰은 @layer gassan.tokens 안에 있으므로, 레이어 밖에서 쓰면 명시도를 신경 쓰지 않고 덮어쓸 수 있다.',
    code: ':root {\n  --g-accent: #0b5cad;\n  --g-on-accent: #ffffff;\n  --g-accent-muted: #5f7184; /* 흰 글자로 4.5:1 이상인지 확인한 뒤에 */\n  --g-radius: 20px;\n}',
  },
} satisfies typeof ja;
