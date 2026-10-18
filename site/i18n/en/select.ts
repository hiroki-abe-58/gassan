import type ja from '../ja/select';

export default {
  lead: 'Select is a dropdown whose list gassan draws itself; Combobox is a dropdown you narrow down by typing. The list opens in the top layer via popover, so it is clipped neither by the modal’s transform nor by the body’s scrolling.',
  gallery: {
    title: 'Examples',
    intro: 'The arrow sits inside the frame’s padding. Even with padding, a native select draws its arrow stuck to the right edge.',
    items: {
      select: 'Select',
      placeholder: 'Nothing selected',
      combobox: 'Combobox',
      invalid: 'Error',
      disabled: 'Disabled',
    },
    samples: {
      sizeLabel: 'Size',
      sizeS: 'Small (360px)',
      sizeM: 'Medium (520px)',
      sizeL: 'Large (720px)',
      cityLabel: 'City',
      citySapporo: 'Sapporo',
      cityTokyo: 'Tokyo',
      cityNagoya: 'Nagoya',
      cityOsaka: 'Osaka',
      cityFukuoka: 'Fukuoka',
    },
  },
  modal: {
    title: 'Inside a modal',
    intro: 'While the list is open, Esc closes only the list, not the modal.',
    exampleTitle: 'Choose a delivery destination',
    exampleDescription: 'Type to narrow down the country. Matching ignores letter case and full-width/half-width differences.',
  },
  keys: {
    title: 'Keyboard interaction',
    tableCaption: 'Keyboard interaction for Select and Combobox',
    head: { key: 'Key', select: 'Select', combobox: 'Combobox' },
    rows: [
      { key: '↓ / ↑', select: 'Opens. When open, moves to the next / previous option', combobox: 'Opens. When open, moves to the next / previous option' },
      { key: 'Home / End', select: 'To the first / last option', combobox: 'To the start / end of the input (native behavior)' },
      { key: 'Letters', select: 'Jumps to the option that starts with that character', combobox: 'Filters the list and highlights the first match' },
      { key: 'Enter', select: 'Selects and closes', combobox: 'Selects the highlighted option (not during IME composition)' },
      { key: 'Space', select: 'Selects and closes (during type-ahead, it is treated as a character)', combobox: 'Types a space' },
      { key: 'Tab', select: 'Selects the highlighted option and moves on', combobox: 'Selects on an exact match; otherwise restores the previous value and moves on' },
      { key: 'Esc', select: 'Closes only the list', combobox: 'Closes only the list' },
    ],
  },
  a11yCaption: 'Specification items select and combobox satisfy',
} satisfies typeof ja;
