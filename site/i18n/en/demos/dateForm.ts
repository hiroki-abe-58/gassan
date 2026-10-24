import type ja from '../../ja/demos/dateForm';

export default {
  open: 'Make a reservation',
  title: 'Make a reservation',
  date: 'Date',
  dateHelp: 'Today or later',
  time: 'Time',
  timeHelp: '11:00–21:00, every 15 minutes',
  people: 'Party size',
  peopleUnit: 'people',
  cancel: 'Cancel',
  submit: 'Reserve',
  comments: {
    today: 'Today by the device’s clock (YYYY-MM-DD). sv-SE formats dates this way',
    calendar: 'The calendar opens in the top layer. Month names and weekdays come from Intl with labels.locale (I-13)',
    time: 'The time is picked from hour and minute columns. Times off the step or outside business hours cannot be chosen (I-20)',
  },
} satisfies typeof ja;
