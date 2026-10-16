import type ja from '../ja/rules';

export default {
  lead: 'AI and veterans alike fall into the same holes in the same order. The prohibitions, scoring rubric and pre-release checklist are here so you can check against them mechanically before you fall in.',
  prohibitions: {
    title: 'Prohibitions',
    intro: 'Ordered by how often AI writes them. If you hit even one, rewrite.',
    tableCaption: 'Prohibitions',
  },
  rubric: {
    title: 'Quality rubric',
    intro: 'Out of 15 points. Below 12, go back and choose the kind again (decision matrix).',
    tableCaption: 'Quality rubric',
    structureCaption: 'How the score is built',
    formulaIntro: [
      'For each implementation, write one sentence in the following form. Whatever you can put after “ただし” (“however”) is the reason for a deduction. Keep fixing until there is nothing left to put there.',
    ],
  },
  checklist: {
    title: 'Pre-release checklist',
    intro: 'Use it while checking your own modal. Checks live only on this screen and are not saved.',
    progress: (done: number, total: number): string => `${String(done)} / ${String(total)} items`,
  },
  antipatterns: {
    title: 'Anti-pattern conversion table',
    intro: 'Common ways of writing it, and what to replace them with.',
    tableCaption: 'Anti-pattern conversion table',
  },
} satisfies typeof ja;
