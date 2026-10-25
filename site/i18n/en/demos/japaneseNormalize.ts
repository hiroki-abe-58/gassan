import type ja from '../../ja/demos/japaneseNormalize';

export default {
  postalCode: 'Postal code',
  postalCodeHelp: 'Becomes “123-4567”, with or without 〒, full-width digits or a hyphen',
  phone: 'Phone number',
  phoneHelp: 'Digits only (+81 becomes 0)',
  kana: 'Furigana',
  kanaHelp: 'Hiragana and half-width kana become katakana',
  company: 'Company name',
  companyHelp: 'Alphanumerics become half-width, half-width kana become full-width',
  invoice: 'Invoice registration number',
  invoiceHelp: 'Adds the T even if you start with the digits',
  legacy: 'Address for a system that requires full-width text',
  legacyHelp: 'Alphanumerics and spaces become full-width too',
  comments: {
    postalCode: 'Normalizes on every keystroke (leaves IME composition alone). onChange receives the normalized value',
    phone: 'The value is digits only (no separators, since placing them would need a table of area codes)',
    legacy: 'Instead of saying “Please enter this in full-width characters”, the receiving side converts it to full-width',
    received: 'The values the app receives',
  },
} satisfies typeof ja;
