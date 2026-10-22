import type ja from '../ja/datePicker';

export default {
  lead: 'DatePicker and DateRangePicker are popup calendars; Calendar and RangeCalendar are calendars placed on the page. All of them show Japanese public holidays and weekends with colors and names, and let you jump to a month or year from the heading. Month names and weekdays come from Intl using the locale of GassanProvider, so changing the language changes the calendar too.',
  gallery: {
    title: 'Examples',
    intro: 'The selected day is filled with the accent color, and today gets a thin ring. Sundays and holidays are red; Saturdays are blue.',
    items: {
      datePicker: 'Calendar',
      rangePicker: 'Date range',
      limited: 'From today, up to 30 days ahead',
      date: 'Date (native)',
      time: 'Time (native)',
      color: 'Color (native)',
    },
  },
  inline: {
    title: 'Calendars on the page',
    intro: 'When users should see the dates as they choose, as with open booking slots or business days, place a Calendar. size="lg" stretches to fill its container and writes holiday names under the days.',
    exampleTitle: 'Book a visit',
    exampleDescription: 'Wednesdays are the regular closing day and cannot be chosen. Days with a dot have only a few slots left.',
  },
  range: {
    title: 'Date ranges',
    intro: 'A range takes two picks: the start date, then the end date. Picking them in reverse order swaps them. Until the end date is picked, a provisional band shows the range up to the day you are pointing at.',
    exampleTitle: 'Export a report',
    exampleDescription: 'Ranges such as “Last 7 days” can be chosen from the list on the left in one step. On wide screens, two months are shown side by side.',
    body: [
      'Which end you are picking now is shown below the calendar and announced with `role="status"`. The days at both ends of the range get “Start date” and “End date” added to their accessible names.',
      'Common ranges (today, yesterday, last 7 days, last 30 days, this month, last month) can be built with `commonDateRanges(useLabels())`. Their names are looked up in `labels.rangePreset`, so they change along with the language.',
    ],
  },
  holidays: {
    title: 'Holidays and weekends',
    intro: 'Japanese public holidays are calculated by applying, for each year, the Act on National Holidays as amended at that time. There is no lookup table, so future years can be looked up too, as long as the law stays the same.',
    tableCaption: (year: number): string => `Public holidays and other days off in ${String(year)}`,
    head: { date: 'Date', name: 'Name' },
    body: [
      'This includes substitute holidays (from 2007, “the first following day that is not a holiday”), the Citizens’ Holiday sandwiched between two holidays, the Happy Monday System, the special rules for the Tokyo 2020 Games, and the days off for the Reiwa enthronement. Vernal Equinox Day and Autumnal Equinox Day are calculated with an approximation formula (the official dates are announced in February of the previous year).',
      'The names come from `labels.holidays`. The Japanese labels default to Japanese public holidays, and the English labels default to none. Each component can override this with `holidays`, and `null` removes them. To add your own company’s closing days, pass a function layered over `japaneseHolidayResolver()`.',
      'Color is never the only cue. The holiday name is part of the day’s accessible name. On screen, a small calendar shows the holiday of the day you are pointing at in a line below it, and a large calendar shows it under the day. The red for Sundays and holidays (`--g-sunday`) and the blue for Saturdays (`--g-saturday`) reach 4.5:1 or more against the surface. For regions that do not color weekdays, set both tokens to `--g-fg`.',
    ],
    codeCaption: 'Changing how holidays are shown',
    code: "import { japaneseHolidayResolver, japaneseHoliday } from '@genelab/gassan';\n\n// Add your company's closing days\nconst closed: Record<string, string> = { '2026-12-29': 'Year-end closure', '2026-12-30': 'Year-end closure' };\nconst holidays = (date: string) => closed[date] ?? japaneseHolidayResolver()(date);\n\n<Modal.DatePicker holidays={holidays} />\n\n// Show no holidays\n<Modal.DatePicker holidays={null} />\n\n// Look up a single day\njapaneseHoliday('2026-09-22'); // { date: '2026-09-22', key: 'citizens', name: \"国民の休日\" }\n// English names: japaneseHoliday('2026-09-22', japaneseHolidayNames.en)?.name → \"Citizens' Holiday\"",
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
      { key: 'Enter / Space', action: 'Selects, closes and returns to the button (for a range, the first press sets the start date and the second the end date)' },
      { key: 'Esc', action: 'Closes without selecting and returns to the button (the modal stays open). In the month and year lists, goes back one level' },
    ],
    note: 'Pressing the heading (“October 2026”) shows a list of months; pressing it again shows a list of years. The arrow keys move within the lists too, and Enter goes down one level. Pressing “Today” goes back to today.',
  },
  native: {
    title: 'DatePicker or the native date input',
    body: [
      'On phones, the OS date wheel is often faster. Use DatePicker when you want users to see the weekdays and holidays as they choose, to show days that cannot be chosen, to let users pick a range, or to match the look of the other components. Otherwise, put `type="date"` in Modal.Input. The frame and the light/dark scheme (`--g-color-scheme`) come out the same (I-15).',
    ],
  },
  apiCaption: {
    datePicker: 'Modal.DatePicker',
    rangePicker: 'Modal.DateRangePicker',
    calendar: 'Modal.Calendar',
    rangeCalendar: 'Modal.RangeCalendar',
  },
  a11yCaption: 'Specification items date and time inputs satisfy',
} satisfies typeof ja;
