import type ja from '../ja/rules';

export default {
  lead: 'AI도 베테랑도 같은 순서로 같은 구멍에 빠진다. 빠지기 전에 기계적으로 대조할 수 있도록 금지 사항·채점표·공개 전 체크리스트를 둔다.',
  prohibitions: {
    title: '금지 사항',
    intro: 'AI가 쓰기 쉬운 순서로 나열했다. 하나라도 해당되면 다시 쓴다.',
    tableCaption: '금지 사항',
  },
  rubric: {
    title: '품질 루브릭',
    intro: '15점 만점. 12점 미만이면 유형 선택(의사 결정 매트릭스)으로 돌아간다.',
    tableCaption: '품질 루브릭',
    structureCaption: '채점 구조',
    formulaIntro: [
      '각 구현에 대해 다음 형식으로 한 문장을 쓴다. 「ただし」(단,) 뒤를 채울 수 있다면 그것이 감점 이유다. 채워지지 않을 때까지 고친다.',
    ],
  },
  checklist: {
    title: '공개 전 체크리스트',
    intro: '자신의 모달로 확인하면서 쓴다. 체크는 이 화면 안에서만 유지되며 저장하지 않는다.',
    progress: (done: number, total: number): string => `${String(done)} / ${String(total)}개 항목`,
  },
  antipatterns: {
    title: '안티패턴 변환표',
    intro: '자주 보이는 작성법과 그 대체 방법.',
    tableCaption: '안티패턴 변환표',
  },
} satisfies typeof ja;
