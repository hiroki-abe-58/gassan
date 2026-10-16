import type ja from '../ja/chart';

export default {
  lead: 'A container for charts. It draws nothing. It wires a name, a summary of the trend and a disclosure of the raw data to the chart you bring, because a bare canvas carries zero information for a screen reader.',
  report: {
    title: 'Name, summary and raw data',
    intro: 'label and summary are required. The chart itself is aria-hidden by default, so the summary and raw data are the only path.',
    exampleTitle: 'Monthly report',
    exampleDescription: 'Open “Show data” to read the same numbers in a table.',
  },
  why: {
    title: 'Why it does not draw',
    body: [
      'There are many charting libraries, and the best one depends on the use. If gassan bundled one, choosing it would let down every user of the others. So the chart can be SVG, canvas or any library. gassan takes on only the three things almost every chart lacks: a “name”, a “text alternative for the trend” and “access to the raw data”.',
      'If the chart is accessible on its own, for example navigable with a keyboard, `visualAccessible` removes the `aria-hidden`.',
    ],
    mockTitle: 'Monthly sales (USD thousands)',
    mockSummary: 'March peaked at 120. From April onward it stays flat.',
    mockDisclosure: 'Show data',
    do: 'Give the chart a name and a summary of the trend, and let the raw data open as a table.',
    dont: 'Do not just drop in a canvas or SVG. For people who cannot see it, it is the same as nothing.',
  },
  a11yCaption: 'Specification items Modal.Chart satisfies',
} satisfies typeof ja;
