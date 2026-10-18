import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker picks a date from a calendar. For time and color, the native inputs sit in the Modal.Input frame. Month names and weekdays come from Intl using the locale of GassanProvider, so changing the language changes the calendar too.',
  gallery: {
    title: 'Examples',
    intro: 'The selected day is filled with the accent color, and today gets a thin ring.',
    items: {
      datePicker: 'Calendar',
      limited: 'From today, up to 30 days ahead',
      date: 'Date (native)',
      time: 'Time (native)',
      color: 'Color (native)',
    },
  },
  modal: {
    title: 'Inside a modal',
    intro: 'The calendar opens in the top layer via popover. Esc closes only the calendar and returns focus to the button.',
    exampleTitle: 'Make a reservation',
    exampleDescription: 'Choose the date with the calendar and the time with the native input. Past days cannot be chosen.',
  },
  keys: {
    title: 'Keyboard interaction',
    tableCaption: 'Calendar keyboard interaction',
    head: { key: 'Key', action: 'Action' },
    rows: [
      { key: '← / →', action: 'Previous / next day' },
      { key: '↑ / ↓', action: 'Previous / next week' },
      { key: 'Home / End', action: 'Start / end of the week' },
      { key: 'PageUp / PageDown', action: 'Previous / next month (clamped to the last day of the month)' },
      { key: 'Shift + PageUp / PageDown', action: 'Previous / next year' },
      { key: 'Enter / Space', action: 'Selects, closes and returns to the button' },
      { key: 'Esc', action: 'Closes without selecting and returns to the button (the modal stays open)' },
    ],
  },
  native: {
    title: 'DatePicker or the native date input',
    body: [
      'On phones, the OS date wheel is often faster. Use DatePicker when you want users to see the weekdays as they choose, to show days that cannot be chosen, or to match the look of the other components. Otherwise, put `type="date"` in Modal.Input. The frame and the light/dark scheme (`--g-color-scheme`) come out the same (I-15).',
    ],
  },
  a11yCaption: 'Specification items date and time inputs satisfy',
} satisfies typeof ja;
