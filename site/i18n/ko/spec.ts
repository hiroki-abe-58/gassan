import type ja from '../ja/spec';

export default {
  title: (page: string, count: number): string => `${page}(${String(count)}개 항목)`,
  lead: (categories: number): string =>
    `이상적인 모달이 충족해야 할 동작을 ${String(categories)}개 카테고리로 나눠 한 줄씩 열거한 것. 각 행에는 그것을 어느 테스트·어느 CSS로 충족하는지가 연결되어 있다.`,
  source: (version: string, updated: string): string =>
    `원본은 [modal.skill.md](modal.skill.md) §4(v${version}, ${updated}), 상태와 근거는 [docs/traceability.md](docs/traceability.md). 둘 다 \`npm run check:trace\`가 기계적으로 검증하며, 존재하지 않는 테스트 이름을 근거로 쓰면 CI가 실패한다. 이 페이지는 그 둘로부터 빌드 시 만든다.`,
  filters: {
    label: '명세 필터',
    keyword: '키워드',
    keywordPlaceholder: '예: 포커스, G-03, line-clamp',
    category: '카테고리',
    status: '상태',
    all: '전체',
    priority: '요구 수준',
    priorityOption: (letter: string, label: string): string => `${letter}(${label})`,
    count: (shown: number, total: number): string => `${String(shown)} / ${String(total)}개 항목 표시`,
  },
  categoryItems: (name: string): string => `${name} 항목`,
  statusAndEvidence: '상태와 근거',
  evidence: {
    count: (n: number): string => `근거 ${String(n)}건`,
    kinds: {
      T: '테스트',
      C: 'CSS',
      S: '파일',
      D: '문서',
      B: '실기기 검수',
      R: '로드맵',
      N: '위임 대상',
    },
  },
  empty: '조건에 맞는 항목이 없다. 필터를 완화해 보기 바란다.',
  legend: {
    title: '상태 읽는 법',
    intro: '보장이 강한 순서. “구현”과 “서술”을 섞지 않는 것이 이 표의 요점이다.',
    tableCaption: '상태의 어휘',
  },
} satisfies typeof ja;
