import type ja from '../../ja/demos/dateForm';

export default {
  open: 'Make a reservation',
  title: 'Make a reservation',
  date: 'Date',
  dateHelp: 'Today or later',
  time: 'Time',
  people: 'Party size',
  peopleUnit: 'people',
  cancel: 'Cancel',
  submit: 'Reserve',
  comments: {
    today: 'Today by the device’s clock (YYYY-MM-DD). sv-SE formats dates this way',
    calendar: 'The calendar opens in the top layer. Month names and weekdays come from Intl with labels.locale (I-13)',
    native: 'For the time, the native input sits in the same frame (I-15)',
  },
} satisfies typeof ja;
