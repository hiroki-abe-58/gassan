import type ja from '../../ja/demos/japaneseBank';

export default {
  label: 'Bank account for transfers',
  hint: 'You can also search with “みつびし” or “0005”. Choose Japan Post Bank (“ゆうちょ銀行”), and the branch name and account number for transfers are built from the passbook’s symbol and number (e.g. 10180 and 12345671). The branches are samples.',
  comments: {
    fields: 'The app passes in the bank and branch options (from the Zengin bank code data or an API)',
    zengin: 'Keep the account holder name in full-width katakana, and convert it to the Zengin format (half-width kana) when sending',
  },
} satisfies typeof ja;
