import type ja from '../../ja/demos/chartReport';

export default {
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  may: 'May',
  open: 'Monthly report',
  title: 'Monthly report (Jan–May)',
  label: 'Monthly sales (USD thousands)',
  summary: 'March peaked at 120. From April onward it stays flat at around 100.',
  tableLabel: 'Raw data for monthly sales',
  month: 'Month',
  sales: 'Sales (USD thousands)',
  comments: {
    bars: 'Draw the chart with anything you like. gassan does not draw it.',
    chart: 'The name (label) and the summary of the trend (summary) are required. The chart itself is aria-hidden by default (B-14)',
  },
} satisfies typeof ja;
