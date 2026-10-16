import type ja from '../ja/notes';

export default {
  lead: (count: number): string =>
    `${String(count)} pitfalls that were invisible at the design stage and only surfaced once the code actually ran. They are the kind that are correct on paper and break in code, so they are pinned down here.`,
} satisfies typeof ja;
