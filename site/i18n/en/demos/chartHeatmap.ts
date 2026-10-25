import type ja from '../../ja/demos/chartHeatmap';

export default {
  locale: 'en-US',
  label: 'Usage by day and hour',
  description: 'Weekdays peak at 10 AM and 2 PM; weekends see a third of the weekday traffic. Schedule maintenance for Sunday night.',
  sessions: 'Sessions',
  comments: {
    intl: 'Days and hours are formatted with Intl, the way the viewer’s language writes them (“Mon”, “10 AM” or “月”, “10時”)',
    monday: 'Rows run from Monday (2026-10-05) to Sunday, columns from 6 AM to 11 PM',
  },
} satisfies typeof ja;
