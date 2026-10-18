import type ja from '../../ja/demos/choiceForm';

export default {
  open: 'Notification settings',
  title: 'Notification settings',
  channels: 'How to notify you',
  channelsHelp: 'Choose at least one',
  all: 'All',
  mail: 'Email',
  push: 'Push notifications',
  sms: 'SMS',
  frequency: 'Frequency',
  now: 'Immediately',
  nowNote: 'One at a time, as things happen',
  daily: 'Once a day',
  dailyNote: 'Bundled together at 8 a.m.',
  theme: 'Email appearance',
  light: 'Light',
  dark: 'Dark',
  auto: 'Match device',
  rating: 'Ease of use of this screen',
  cancel: 'Cancel',
  save: 'Save',
  comments: {
    group: 'A group of options is a Fieldset. The legend is the group’s name, and help becomes its description (I-09)',
    mixed: 'When only some are selected: indeterminate (announced as mixed)',
  },
} satisfies typeof ja;
