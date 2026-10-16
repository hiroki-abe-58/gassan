import type ja from '../ja/title';

export default {
  lead: 'The dialog’s name and description. The name is wired to a span inside the h2 and the description to aria-describedby, automatically. Truncation is done in CSS alone, so the name is never cut.',
  clamp: {
    title: 'Long titles',
    intro: 'By default, titles are truncated at 2 lines. A “Show the full title” toggle appears only when the title overflows.',
    exampleTitle: 'Truncating a long title',
    exampleDescription: 'Even when truncated, screen readers read the full title.',
  },
  why: {
    title: 'Why truncate in CSS alone',
    body: [
      'Cutting the string in JS cuts the DOM text itself. The name `aria-labelledby` points to gets cut with it, and screen reader users enter a dialog called “Change the sharing settings of the Q3 Tohoku…”. `line-clamp` cuts only what is shown, so the name always stays complete.',
    ],
    mockLong: 'Change the sharing settings of the Q3 Tohoku region sales report by store',
    mockToggle: 'Show the full title',
    mockCut: 'Change the sharing settings of the Q3 Tohoku…',
    mockTooltip: 'Long-press for the full title',
    do: 'Show the full title with an explicit button that opens it when pressed. It has `aria-expanded` and `aria-controls` (T-08).',
    dont: 'Do not rely on hover, the `title` attribute or long-press. They never appear on touch, and they clash with the OS context menu (T-05 / T-06).',
  },
  a11yCaption: 'Specification items the title and description satisfy',
} satisfies typeof ja;
