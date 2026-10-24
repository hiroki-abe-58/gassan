import type ja from '../../ja/demos/bookingCalendar';

export default {
  label: 'Visit date',
  selected: 'Selected: {0}',
  empty: 'Choose a date',
  comments: {
    today: 'Today by the device’s clock (YYYY-MM-DD). sv-SE formats dates this way',
    large: 'size="lg" stretches to fill its container and writes holiday names under the days. Closing days cannot be chosen, and days with a dot have only a few slots left (I-16 / I-19)',
  },
} satisfies typeof ja;
