import type ja from '../ja/lineBreak';

export default {
  lead: 'No more “プロフィールを編｜集”. gassan never breaks Japanese, Chinese or Korean text in the middle of a word: Japanese wraps only at phrase boundaries, Chinese only between words, Korean only at spaces. In buttons, titles, table cells and chart summaries alike.',
  compare: {
    title: 'Compare at the same width',
    intro:
      'Left is the browser default, right is gassan. Both use the same library; only the left side has lineBreak switched to `browser`. Change the sample language and the width, and see where the lines break.',
    language: 'Sample language',
    width: (em: string): string => `Container width: ${em}em`,
    labels: {
      buttons: 'Buttons',
      title: 'Title',
      table: 'Table',
      chart: 'Chart summary',
      tableLabel: 'Sample change history',
    },
    notes: {
      ja: { browser: 'Breaks between any two characters', phrase: 'Breaks at phrase boundaries' },
      'zh-Hans': { browser: 'Breaks in the middle of words', phrase: 'Breaks between words' },
      'zh-Hant': { browser: 'Breaks in the middle of words', phrase: 'Breaks between words' },
      ko: { browser: 'Breaks in the middle of words (runs of syllables)', phrase: 'Breaks only at spaces' },
      th: { browser: 'Finds word boundaries with a dictionary', phrase: 'Left alone (same as the browser)' },
      en: { browser: 'Breaks at spaces', phrase: 'Left alone (same as the browser)' },
    },
  },
  languages: {
    title: 'How each language is handled',
    intro:
      'Languages that put no spaces between words tend to split mid-word when wrapping is left to the browser. Yet applying the same treatment to every language breaks some of them instead. The break positions were measured in narrow boxes in Chrome, and the handling was decided per language.',
    caption: 'Browser-default line breaking and gassan’s handling, by language',
    head: { language: 'Language', browser: 'Browser default', gassan: 'gassan', why: 'Why' },
    rows: [
      {
        language: 'Japanese',
        browser: 'Breaks between any two characters: “プロフィールを編｜集”, “プロフィール｜を編集”',
        gassan: 'Breaks only at phrase boundaries',
        why: 'There are no spaces between words, and a particle at the start of a line is hard to read.',
      },
      {
        language: 'Chinese (Simplified, Traditional)',
        browser: 'Breaks in the middle of words: “编辑个人资｜料”, “保存更改并关｜闭”',
        gassan: 'Breaks only between words',
        why: 'Breaking between any characters is the typesetting convention, but in short UI strings the last character of a word drops to the next line.',
      },
      {
        language: 'Korean',
        browser: 'Breaks in the middle of words: “프로필 편｜집”, “삭제｜하면”',
        gassan: 'Breaks only at spaces',
        why: 'Words are already separated by spaces, so no markers are added; only the container style (`keep-all`) is applied.',
      },
      {
        language: 'Thai, Lao, Khmer, Burmese',
        browser: 'Finds word boundaries with a dictionary (does not break mid-word)',
        gassan: 'Left alone',
        why: 'Applying `keep-all` also erases the word boundaries the browser found, so words break in the middle after all (measured).',
      },
      {
        language: 'English and other languages that separate words with spaces',
        browser: 'Breaks at spaces',
        gassan: 'Left alone',
        why: 'The browser already breaks lines correctly.',
      },
    ],
    note: 'In every language, the accessible name and the copied text stay unchanged. Detection is based on the characters themselves, so it works the same even if the `lang` attribute is missing.',
  },
  modal: {
    title: 'In a real modal',
    intro: 'A modal 360px wide. Untick the box to go back to the browser default.',
    exampleTitle: 'Line breaking in a narrow modal (Japanese sample)',
    exampleDescription:
      'English already breaks at spaces, so the modal shows a Japanese sample. Compare the footer buttons, the title and the table cells. The accessible name is the same either way.',
  },
  try: {
    title: 'Try your own text',
    intro: 'See on the spot where the text gets split.',
    input: 'Text to try',
    resultLabel: 'Result of splitting',
    split: (count: number): string => `Split into ${String(count)} pieces. Lines break only at these boundaries.`,
    single: 'Text consisting of a single phrase (word) gets no markers.',
    korean: 'Hangul breaks only at spaces. gassan applies only the container style (keep-all) and adds no markers.',
    untouched: 'English, Thai and similar languages are left alone. The browser finds word boundaries from spaces or a dictionary.',
  },
  how: {
    title: 'How it works',
    steps: [
      {
        title: 'Look at the script',
        body: 'Text containing kana is treated as Japanese, text containing Hangul as Korean, and text with neither but containing kanji as Chinese. Anything else (English, Thai and so on) is left alone.',
      },
      {
        title: 'Split into words',
        body: '`Intl.Segmenter`, built into browsers and Node, provides candidate word boundaries. No dependencies are added.',
      },
      {
        title: 'Keep only the positions where a break is allowed',
        body: 'Japanese is grouped into phrases by character-class rules (a break before kanji, katakana or alphanumerics that follow hiragana, after punctuation or closing brackets, and so on; never inside okurigana, after the prefixes “お” and “ご”, or between a number and its unit). Chinese uses the dictionary word boundaries, attaching one-character words to a neighbor. In Korean, the spaces are the boundaries as they are.',
      },
      {
        title: 'Mark the boundaries',
        body: 'Each boundary gets a `<wbr aria-hidden="true">`. Not a single character is added, so copying and searching see the original text.',
      },
      {
        title: 'Break only there',
        body: 'The container gets `word-break: keep-all`, so it does not break between characters. Only when a single phrase is longer than its container does `overflow-wrap: break-word` break it between characters.',
      },
    ],
    cssComments: {
      keepAll: 'no breaks between characters',
      breakWord: 'break between characters only when a phrase is longer than its container',
      strict: 'even then, never start a line with small kana or a long vowel mark',
    },
  },
  name: {
    title: 'Keep the accessible name clean',
    intro: 'Changing where lines break never changes the name a screen reader reads, or the text that gets copied.',
    body: [
      'A plain `<wbr>` turns into a space in the name in Chrome’s accessibility tree. `<button>プロフィールを<wbr>編集</button>` is read as “プロフィールを 編集”, even though the text on screen (`innerText`) has no space. Three approaches were measured in real browsers before choosing one.',
    ],
    tableLabel: 'Comparison of approaches',
    caption: 'Ways to mark line breaks, and their results',
    head: { method: 'Approach', name: 'Accessible name', breaks: 'Breaks at phrases', long: 'Long phrases' },
    rows: [
      { method: '`<wbr aria-hidden="true">` + keep-all (adopted)', name: 'Unchanged', breaks: 'Yes', long: 'No overflow' },
      { method: 'white-space: nowrap on a span per phrase', name: 'Unchanged', breaks: 'Yes', long: 'Overflows' },
      { method: 'word-break: keep-all on a span per phrase', name: 'Unchanged', breaks: 'No (between any characters)', long: '—' },
      { method: 'Plain `<wbr>`', name: 'Spaces get mixed in', breaks: 'Yes', long: 'No overflow' },
    ],
    callout: 'Zero-width spaces are not used. They are invisible yet remain as characters, quietly breaking copied text, search and comparisons with input values.',
  },
  use: {
    title: 'Usage',
    intro: 'Inside gassan’s components, line breaking is handled without writing anything. For UI outside gassan, Phrase applies the same line breaking.',
    codeComments: {
      outside: 'Apply it to buttons and headings outside gassan too',
      revert: "Leave line breaking to the browser (the default is 'phrase')",
    },
    body: [
      'The markers land in the same positions on the server and the client, so hydration never mismatches. CSS `word-break: auto-phrase` solves the same problem on the browser side, but browser and language support is limited, and break positions differ between browsers. gassan breaks at the same positions in every browser.',
    ],
  },
  spec: {
    title: 'Line breaking items',
    caption: 'Line breaking specification',
  },
} satisfies typeof ja;
