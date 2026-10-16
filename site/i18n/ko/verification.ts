import type ja from '../ja/verification';

export default {
  lead: '“테스트가 녹색이다”와 “보장되어 있다”는 별개다. 무엇을 어느 단계에서 검증하고, 무엇을 아직 검증하지 못했는지 나눠서 쓴다.',
  stats: {
    tests: (files: number): string => `테스트(${String(files)}개 파일)`,
    items: '동작 항목',
    proven: '테스트로 증명된 항목',
    device: '실기기에서만 확인할 수 있는 항목',
  },
  pipeline: {
    intro: '위에서부터 차례로 실행되며, 하나라도 실패하면 멈춘다. 아래 단계일수록 위 단계에서는 원리적으로 찾을 수 없는 사고를 잡는다.',
    steps: [
      { command: 'tsc --noEmit', catches: '타입 불일치' },
      { command: 'eslint .', catches: '정적으로 알 수 있는 실수' },
      { command: 'vitest run', catches: '접근 가능한 이름, 게이트의 논리합, 닫기 이유의 분류, 색 대비율' },
      { command: 'check:trace', catches: '명세 항목과 근거의 누락·잉여, 존재하지 않는 테스트 이름의 인용, 문서에 쓴 개수의 어긋남' },
      { command: 'check:docs', catches: 'README와 docs의 코드 예제가 공개 API로 컴파일되지 않는 것' },
      { command: 'tsup', catches: 'ESM / CJS / 타입 생성 실패' },
      { command: 'check:dist', catches: '"use client" 소실, 공개 API 누락, 크기 예산 초과' },
      {
        command: 'check:ssr',
        catches: '렌더 중의 window 참조(Next.js App Router에서 실패한다), SSR 시점 게이트의 fail-open',
      },
      {
        command: 'check:pack',
        catches: 'npm에 올라가는 형태의 사고(LICENSE 누락, types 조건 혼동, 동봉 문서의 링크 끊김)',
      },
    ],
  },
  status: {
    title: '항목의 상태',
    intro: (count: number): string => `${String(count)}개 항목 각각이 어느 강도로 보장되는가.`,
    count: (n: number): string => `${String(n)}개 항목`,
    weakMust: (n: number): string =>
      `필수(M)인데 “서술” 상태인 항목이 ${String(n)}건 있다. 값은 기계적으로 검증하지만, 렌더링 결과는 실제 브라우저에서만 확인할 수 있다. 이것이 이 라이브러리의 현재 약점이며, 숨기지 않고 드러낸다.`,
  },
  device: {
    title: 'jsdom으로는 검증할 수 없는 것',
    intro:
      'top layer·퇴장 애니메이션·스크림 농도처럼, 렌더링하지 않으면 참거짓이 정해지지 않는 항목. examples/css-check.html을 실기기에서 열면 같은 항목이 체크박스로 되어 있다.',
    tableCaption: '실기기 검수표',
    columns: { id: 'ID', item: '항목', how: '확인 방법', diagnosis: '실패했다면' },
    pending: (n: number): string =>
      `이 ${String(n)}개 항목은 아직 실기기에서 확인하지 않았다(ROADMAP v0.2.0). 실제 브라우저에서의 자동 검사(Playwright + axe)는 v0.4.0에서 도입한다. 자세한 내용은 [VERIFICATION.md](VERIFICATION.md)와 [ROADMAP.md](ROADMAP.md).`,
  },
} satisfies typeof ja;
