import type ja from '../../ja/demos/titleClamp';

export default {
  open: 'Modal with a long title',
  title:
    'Change the sharing settings of the FY2026 Q3 Tohoku region sales report by store (including preliminary figures, year-over-year comparison, inventory turnover and labor cost ratio)',
  description: '“Show the full title” appears only when the title overflows. No reliance on hover, the title attribute or long-press.',
  submit: 'Save changes',
  comments: {
    clamp: 'Truncation is CSS line-clamp only. The DOM text is always complete, so the name is never cut',
  },
} satisfies typeof ja;
