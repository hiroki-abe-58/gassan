import type ja from '../ja/spec';

export default {
  title: (page: string, count: number): string => `${page} (${String(count)} items)`,
  lead: (categories: number): string =>
    `The behaviors an ideal modal must satisfy, sorted into ${String(categories)} categories and listed one per row. Each row is tied to the tests and CSS that satisfy it.`,
  source: (version: string, updated: string): string =>
    `The source is §4 of [modal.skill.md](modal.skill.md) (v${version}, ${updated}); status and evidence come from [docs/traceability.md](docs/traceability.md). Both are verified mechanically by \`npm run check:trace\`, and citing a test name that does not exist as evidence fails CI. This page is built from those two files at build time.`,
  filters: {
    label: 'Filter the specification',
    keyword: 'Keyword',
    keywordPlaceholder: 'e.g. G-03, line-clamp, aria-disabled',
    category: 'Category',
    status: 'Status',
    all: 'All',
    priority: 'Requirement level',
    priorityOption: (letter: string, label: string): string => `${letter} (${label})`,
    count: (shown: number, total: number): string => `Showing ${String(shown)} / ${String(total)} items`,
  },
  categoryItems: (name: string): string => `${name} items`,
  statusAndEvidence: 'Status and evidence',
  evidence: {
    count: (n: number): string => `Evidence (${String(n)})`,
    kinds: {
      T: 'Test',
      C: 'CSS',
      S: 'File',
      D: 'Document',
      B: 'On-device check',
      R: 'Roadmap',
      N: 'Delegated to',
    },
  },
  empty: 'No items match. Try loosening the filters.',
  legend: {
    title: 'How to read the status',
    intro: 'Strongest guarantee first. The whole point of this table is never to mix “Implemented” with “Described”.',
    tableCaption: 'Status vocabulary',
  },
} satisfies typeof ja;
