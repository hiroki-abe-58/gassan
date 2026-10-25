import type ja from '../ja/japaneseInput';

export default {
  lead: 'Removes the reasons people give up on Japanese forms, right in the input components. Full-width and half-width characters, hyphens or no hyphens, hiragana and katakana: the receiving side makes these consistent instead of making the person who typed them fix them (no “Please enter this in full-width characters”). Whatever can be worked out ahead of time, like the address from the postal code or the furigana (kana reading) from the name as it is typed, is filled in, and values the person typed or the browser autofilled are never overwritten.',
  principles: {
    title: 'Rules that keep people from giving up',
    rows: [
      '**Don’t turn differences that can be normalized into errors.** Full-width and half-width characters, the kind of hyphen, hiragana and katakana, and the way a phone number is written are all fixed on the receiving side.',
      '**Fill in what can be worked out ahead of time.** But never overwrite values entered by the user or by the browser’s autofill.',
      '**Don’t move focus on your own.** Move it only when the user chooses to, such as when they press a suggestion button.',
      '**Let the browser’s autofill work.** Give each field an `autocomplete` name, and make the prefecture and the date of birth native selects.',
      '**Let the user decide whether to correct it.** A mistyped email address only gets a suggestion and is never corrected on its own. The reading is a guess, so the furigana can always be edited.',
    ],
  },
  normalize: {
    title: 'Normalizing what is typed',
    intro: 'Pass `normalize` to `Input`, and the text is normalized as you type. It leaves the text alone during IME composition and normalizes it on commit, paste and autofill, keeping the caret in place. `onChange` receives the normalized value. Every function holds up even when applied to a string that is still being typed.',
    exampleTitle: '6 fields',
    exampleDescription: 'Try typing a mix of full-width digits, different kinds of hyphens and hiragana. The values the app receives appear below.',
  },
  address: {
    title: 'Address (filled in from the postal code)',
    intro: 'Lays out the postal code, prefecture, city, street address and building name, using names that browser autofill understands. Once all 7 digits of the postal code are in, it looks up the address with `lookup` and fills in only the empty fields. The result is shown below the fields and announced to screen readers, and focus does not move. The library holds no address data and sends nothing anywhere.',
    exampleTitle: 'Shipping address',
    exampleDescription: 'Type a postal code, and the address fills in 0.4 seconds later (sample data). Add a block number to “Street address” and then change the postal code, and only the town name is replaced.',
  },
  name: {
    title: 'Name and furigana',
    intro: 'Asks for the family name and the given name separately (so autofill works), and fills in the furigana from the kana typed before IME conversion. Once the user edits the furigana, it is left alone from then on. To ask for the furigana in hiragana, pass `kana="hiragana"`; to not ask for it, pass `kana={false}`.',
    exampleTitle: 'Name',
    exampleDescription: 'Turn on a Japanese IME, then type a family name and a given name and convert them.',
  },
  birthDate: {
    title: 'Date of birth',
    intro: 'Three native selects for the year, month and day (autofill and smartphone pickers work). Nobody has to page back through decades of a calendar. Each year comes with its Japanese era year, and once all three are chosen, the age is shown. Check age requirements with `ageOn`.',
    exampleTitle: 'Must be 20 or older',
    exampleDescription: 'Choose a date that makes you under 20, and you get an error. With February chosen, days after the 29th can’t be selected.',
  },
  email: {
    title: 'Email address',
    intro: 'Fixes full-width characters and the “。” and “ー” typed with the IME still on, and when you leave the field, suggests a fix for typos in common domains. For mobile carrier addresses, it shows a notice that the confirmation email may not arrive because of spam filter settings.',
    exampleTitle: 'Where we send the confirmation email',
    exampleDescription: 'Type “taro@gmial.com” and leave the field.',
  },
  bank: {
    title: 'Bank account for transfers',
    intro: 'The bank and the branch are lists of options you can search by kana or by code. The account holder name is normalized to full-width katakana even when typed in hiragana or half-width kana, and `toZenginKana` converts it to the Zengin (bank transfer) format when you send it. For Japan Post Bank, the branch name and account number used for transfers are derived from the symbol and number in the passbook.',
    exampleTitle: 'Payout account for sales',
    exampleDescription: 'Type “みつびし” or “0005” in the bank field. Japan Post Bank (“ゆうちょ銀行”) is in the list too.',
  },
  recipes: {
    title: 'What to use for each field',
    intro: 'Fields without a dedicated group component can be handled the same way, with `normalize` on `Input` and the checking functions.',
    tableCaption: 'Components and normalization for each field',
    head: { field: 'Field', use: 'What to use', value: 'Value received' },
    rows: [
      { field: 'Postal code only (for a shipping estimate and so on)', use: '`Input` + `normalize={formatPostalCode}`', value: '`123-4567`' },
      { field: 'Address', use: '`AddressFields` (pass `lookup`)', value: '`{ postalCode, prefecture, city, line1, line2 }`' },
      { field: 'Phone number', use: '`Input type="tel"` + `normalize={normalizePhone}`', value: '`09012345678` (digits only)' },
      { field: 'Number to send an SMS to', use: 'Same as above + check with `isMobilePhone`', value: '11 digits starting with 060, 070, 080 or 090' },
      { field: 'Email address', use: '`EmailInput`', value: '`taro@gmail.com`' },
      { field: 'Name and furigana', use: '`NameFields`', value: '`{ familyName, givenName, familyNameKana, givenNameKana }`' },
      { field: 'Date of birth', use: '`BirthDateInput` + `ageOn`', value: '`1990-04-01`' },
      { field: 'Company or trade name', use: '`Input` + `normalize={normalizeText}`', value: 'Half-width alphanumerics, full-width kana' },
      { field: 'Corporate number', use: '`Input` + `normalize={digitsOf}` + `isCorporateNumber`', value: '13 digits (the check digit is verified too)' },
      { field: 'Qualified invoice registration number', use: '`Input` + `normalize={normalizeInvoiceNumber}` + `isInvoiceNumber`', value: '`T` followed by 13 digits' },
      { field: 'My Number (individual number)', use: '`Input` + `normalize={digitsOf}` + `isMyNumber`', value: '12 digits (why you collect it and how you store it must follow the My Number Act)' },
      { field: 'Bank account for transfers', use: '`BankAccountFields` (`toZenginKana` when sending)', value: 'Bank, branch, account type, account number and holder name' },
      { field: 'Fields sent to systems that require full-width text', use: '`Input` + `normalize={toFullWidth}`', value: 'Full-width characters' },
    ],
  },
  functions: {
    title: 'Normalizing and checking functions',
    intro: 'All of them are pure functions, so you can use the same ones for validation on the server. The checking functions accept any notation (full-width, hyphens, spaces, 〒) and reject only values that contain letters or kana.',
    tableCaption: 'Functions, with examples and results',
    head: { name: 'Function', input: 'Example', output: 'Result' },
  },
  lookup: {
    title: 'Connecting an address lookup',
    intro: '`lookup` receives the 7 digits and returns an array of candidates (prefecture, city and town). It may return a Promise. The most reliable approach is to host Japan Post’s postal code data on your own server and look it up there. If you use an external API, check its terms of use and whether you are allowed to send postal codes outside. The component discards results for a postal code that has since changed.',
    code: `import { AddressFields, type PostalAddress } from '@genelab/gassan';

// Look up the Japan Post postal code data hosted on your own server
async function lookup(postalCode: string): Promise<PostalAddress[]> {
  const response = await fetch(\`/api/postal-codes/\${postalCode}\`);
  if (!response.ok) return [];
  return response.json(); // [{ prefecture: '東京都', city: '千代田区', town: '千代田' }]
}

export function ShippingAddress() {
  return <AddressFields label="Shipping address" required lookup={lookup} autoCompleteSection="shipping" />;
}`,
  },
  a11yCaption: 'How the Japanese inputs behave',
} satisfies typeof ja;
