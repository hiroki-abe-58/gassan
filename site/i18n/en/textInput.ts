import type ja from '../ja/textInput';

export default {
  lead: 'Input, PasswordInput, SearchInput, Textarea, NumberField, CodeInput, TagInput and PasswordStrength. Underneath they stay native input and textarea elements; gassan adds only the frame and a few small conventions the native controls lack (a visibility toggle, clearing, a character count, stepping, digit boxes, tags and a strength meter).',
  gallery: {
    title: 'Examples',
    intro: 'The real components, laid out by state. The same components work outside a modal too. Change the theme at the top right, and the focus ring changes color.',
    items: {
      plain: 'Text',
      adorned: 'Units before and after',
      password: 'Password',
      search: 'Search',
      textarea: 'With character count',
      number: 'Number stepper',
      code: 'Verification code',
      invalid: 'Error',
      disabled: 'Disabled',
    },
    samples: {
      name: 'Jane Doe',
      price: '1200',
      yen: '¥',
      perMonth: '/ month',
      search: 'Find a component',
      bio: 'A self-introduction written inside a modal.',
      seats: 'seats',
      invalidValue: 'jane@',
    },
  },
  tags: {
    title: 'Tags',
    intro: 'Add a tag with Enter or a comma (, 、 or ，), and remove one with × or with Backspace in an empty input (Backspace puts the last tag back into the input, so you can fix it rather than delete it). Pasting “Sales, Engineering, Hiring” splits it into 3 tags, and Enter during IME composition adds nothing.',
    items: {
      plain: 'Add and remove',
      suggestions: 'With suggestions',
      limit: 'Up to 3',
    },
    samples: {
      design: 'Design',
      billing: 'Billing',
      placeholder: 'Type a tag and press Enter',
      sales: 'Sales',
      engineering: 'Engineering',
      support: 'Support',
      hiring: 'Hiring',
    },
  },
  strength: {
    title: 'Password strength',
    intro: 'Shows a meter in 4 segments, a word for the strength, and a mark and status for each rule. Nothing is announced on every keystroke: the input points to it with aria-describedby, so the rules are read when focus enters the input.',
    items: {
      live: 'Type to try it',
      custom: 'Custom rules',
    },
    samples: {
      password: 'Gassan2026',
      passphrase: 'correct horse battery',
      longRule: 'At least 15 characters',
    },
  },
  modal: {
    title: 'Inside a modal',
    intro: 'Spread the wiring that the Modal.Field render prop passes, and hand it on as is.',
    exampleTitle: 'Create an account',
    exampleDescription: 'Try showing the password, the character count, stepping the seat count and the verification code. Type all 6 digits of the code, and the form is ready to submit right away.',
  },
  adds: {
    title: 'What gassan adds',
    tableCaption: 'What each text input component adds',
    head: { part: 'Component', adds: 'What it adds' },
    rows: [
      { part: 'Modal.Input', adds: 'The frame and adornments before and after (start / end). ref and input attributes reach the input as is' },
      { part: 'Modal.PasswordInput', adds: 'A visibility toggle. Its state is conveyed with aria-pressed, so a single label is enough' },
      { part: 'Modal.SearchInput', adds: 'A “Clear” button that appears only when there is a value. After clearing, focus returns to the input' },
      { part: 'Modal.Textarea', adds: '“n / max” when maxLength is passed. It is read as a description and does not interrupt on every keystroke. The height grows to fit the content' },
      { part: 'Modal.NumberField', adds: '− and +. They can no longer be pressed at the ends of the range, and values are rounded to the step’s precision. On blur, a value outside the range is pulled back to the nearest end' },
      { part: 'Modal.CodeInput', adds: 'Digit boxes. It stays a single input, so SMS autofill and pasting work. Full-width digits are accepted too' },
      { part: 'Modal.TagInput', adds: 'Adding and removing tags, and announcing it. It handles separators, pasting, Enter during IME composition and Backspace. Pass name, and it places a hidden input for each tag' },
      { part: 'Modal.PasswordStrength', adds: 'A strength meter and a list of rules. Words accompany the colors and marks, and nothing is announced on every keystroke' },
    ],
  },
  apiNote: 'PasswordInput and SearchInput take ModalInputProps minus type, start and end; Textarea takes the textarea attributes as is. In every case, ref reaches the inner element.',
  a11yCaption: 'Specification items text inputs satisfy',
} satisfies typeof ja;
