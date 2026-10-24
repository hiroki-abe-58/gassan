import type ja from '../ja/chart';

export default {
  lead: 'A container for charts you bring (any library, or your own SVG or canvas). It wires a name, a summary of the trend and a disclosure of the raw data to the chart, because a bare canvas carries zero information for a screen reader. To draw a chart with gassan, use the “Charts” UI parts (LineChart and others).',
  report: {
    title: 'Name, summary and raw data',
    intro: 'label and summary are required. The chart itself is aria-hidden by default, so the summary and raw data are the only path.',
    exampleTitle: 'Monthly report',
    exampleDescription: 'Open “Show data” to read the same numbers in a table.',
  },
  why: {
    title: 'When to use it instead of the chart parts',
    body: [
      'The charts gassan draws (the “Charts” UI parts) carry their own name, summary, raw-data table and keyboard exploration that is read aloud. This container is for every other chart. gassan does not draw some kinds, such as maps, network diagrams and 3D, and sometimes you want the charting library you already know. The chart can be SVG, canvas or any library. This container takes on only the three things almost every chart lacks: a “name”, a “text alternative for the trend” and “access to the raw data”.',
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
