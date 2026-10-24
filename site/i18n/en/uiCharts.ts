import type ja from '../ja/uiCharts';

export default {
  lead: 'Charts that draw numbers such as revenue over time, sign-ups by plan and usage rates straight from the data. They are drawn in SVG and HTML without adding any dependencies, and you can step through the points with the keyboard and have their values read out. Colors follow the theme.',
  line: {
    title: 'Line and area',
    intro: 'For numbers that change over time. Series can be shown and hidden from the legend. Hover over a point or move to it with the keyboard, and the values for that month appear together.',
    exampleTitle: 'Monthly revenue and costs',
    exampleDescription: 'area fills the space under the lines. Add table, and “Show data” below opens a table.',
  },
  bar: {
    title: 'Bar',
    intro: 'For comparing items with one another. You can choose whether series sit side by side or are stacked, and negative values extend from the zero line to the opposite side.',
    stackedTitle: 'New sign-ups by plan',
    stackedDescription: 'stacked stacks the series. Only the segment farthest from zero gets a rounded end.',
    horizontalTitle: 'Uses by feature',
    horizontalDescription: 'layout="horizontal" turns them into horizontal bars. Suited to items with long names.',
  },
  widgets: {
    title: 'Small charts for cards',
    intro: 'Four charts to place in dashboard cards: a small trend (Sparkline), a meter (Gauge), a donut (DonutChart) and ranked bars (BarList).',
    exampleTitle: 'Dashboard cards',
    exampleDescription: 'Hover over a donut segment or its legend entry, and its value and share appear in the middle. The meter has its value read out through role="meter".',
  },
  choose: {
    title: 'Choosing a chart',
    intro: 'Choose by what you want to show. When in doubt, use bars. Length can be read more accurately than angle or area.',
    tableCaption: 'How to choose a chart',
    head: { chart: 'Component', when: 'Suited to', avoid: 'Not suited to' },
    rows: [
      { chart: 'LineChart', when: 'Numbers that change over time (revenue over time, number of users)', avoid: 'Items whose order has no meaning' },
      { chart: 'LineChart (area)', when: 'How an amount changes over time, and its breakdown (stacked)', avoid: 'Comparing more than four series' },
      { chart: 'BarChart', when: 'Comparing items, breakdowns (stacked), increases and decreases (negative values)', avoid: 'Trends with many points (such as 90 days)' },
      { chart: 'DonutChart', when: 'Shares of a whole (up to five items)', avoid: 'Comparing items of similar size' },
      { chart: 'Sparkline', when: 'A trend to go alongside a table or card', avoid: 'When values need to be read precisely' },
      { chart: 'BarList', when: 'Rankings (most viewed pages, traffic sources)', avoid: 'Changes over time' },
      { chart: 'Gauge', when: 'A single amount with an upper limit (usage rate, goal completion)', avoid: 'Amounts with no upper limit' },
    ],
  },
  access: {
    title: 'Screen readers and keyboard',
    intro: 'A chart has a name (label) and a sentence on its main trend (description). Only one point is a Tab stop. Move to a neighboring point with the arrow keys, and the item and the value of each series are read out together. The tooltip only shows the same values on screen, so it is not read out.',
    tableCaption: 'Chart keyboard interaction',
    head: { key: 'Key', action: 'Action' },
    rows: [
      { key: 'Tab', action: 'Moves into the chart’s points (the point you were last on, or the first point). Press it again to move on to the next element' },
      { key: '→ / ↓', action: 'Next point. Stops at the end' },
      { key: '← / ↑', action: 'Previous point' },
      { key: 'Home / End', action: 'First / last point' },
      { key: 'Enter / Space (legend)', action: 'Hides or brings back the series. The last one left is not hidden' },
    ],
  },
  colors: {
    title: 'Colors',
    intro: 'Series are colored in order, starting from --g-chart-1. 1 follows the accent, while 2–8 are fixed colors with hues spaced apart, and each of them reaches 3:1 or more against the surface. So that a series is never conveyed by color alone, its name is given in the legend, the tooltip and what is read out.',
    listLabel: 'Series colors',
  },
  codeCaption: 'Usage',
  code: "import { LineChart } from '@genelab/gassan';\n\nconst rows = [\n  { month: 'Jan', revenue: 1180000, cost: 820000 },\n  { month: 'Feb', revenue: 1240000, cost: 850000 },\n  { month: 'Mar', revenue: 1520000, cost: 900000 },\n];\n\n<LineChart\n  label=\"Monthly revenue and costs\"\n  description=\"Revenue is highest in March\"\n  data={rows}\n  x=\"month\"\n  series={[\n    { key: 'revenue', label: 'Revenue' },\n    { key: 'cost', label: 'Costs' },\n  ]}\n  valueFormat={{ style: 'currency', currency: 'JPY' }}\n  area\n/>",
  a11yCaption: 'How the charts behave',
} satisfies typeof ja;
