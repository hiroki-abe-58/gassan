import type ja from '../ja/color';

export default {
  lead: 'Every color is a custom property with a light and a dark value. Which pair carries which text is decided up front, and the ratios are computed in tests.',
  tokens: {
    title: 'Color tokens',
    intro: 'Read from @layer gassan.tokens in src/styles.css. Where the dark column is empty, the light value is used as is.',
    tableCaption: 'Color tokens',
    token: 'Token',
    light: 'Light',
    dark: 'Dark',
  },
  contrast: {
    title: 'Contrast ratios',
    intro: 'The tables below are computed from the tokens at the moment this page was opened. tests/tokens.test.ts uses the same pairs and the same calculation, and CI fails if a ratio drops below the requirement.',
    tableCaption: { light: 'Light contrast ratios', dark: 'Dark contrast ratios' },
    sample: 'Sample',
    pair: 'Pair',
    use: 'Use',
    ratio: 'Ratio',
    min: 'Minimum',
    uses: {
      fg: 'Body text',
      'fg-muted': 'Secondary text, tertiary, gated secondary',
      'on-accent': 'primary',
      'on-accent-muted': 'Gated primary (G-10)',
      'on-danger': 'danger button (F-06)',
      danger: 'Error text, required marker',
      focus: 'Focus ring (K-07; 3:1 for non-text)',
    },
    pass: (min: number): string => `Pass (${String(min)}:1 or more)`,
    fail: (min: number): string => `Fail (below ${String(min)}:1)`,
    callout:
      'The gated primary (`--g-accent-muted`) once had only 3.16:1 with white text. The comment said “keeps 4.5:1”, and the traceability table claimed “value checked”, yet nobody had actually computed the ratio. It was found while building this page to display the ratios.',
  },
  gated: {
    title: 'A button that cannot be pressed must still be readable',
    body: [
      '`disabled` elements are exempt from the WCAG contrast requirements. But gassan’s gated button uses `aria-disabled`: it can be focused, and pressing it returns a reason, so it is a usable button. The exemption does not apply. That is why it keeps 4.5:1 with dedicated tokens instead of being faded with `opacity` (G-10).',
      'Background tokens are also never reused as text colors. In dark mode, no single color reaches 4.5:1 both as a background carrying light text and as text on a dark surface.',
    ],
  },
  theme: {
    title: 'Make it your own color',
    intro: 'The tokens live inside @layer gassan.tokens, so writing them outside that layer overrides them without any specificity concerns.',
    code: ':root {\n  --g-accent: #0b5cad;\n  --g-on-accent: #ffffff;\n  --g-accent-muted: #5f7184; /* check 4.5:1 or more with white text first */\n  --g-radius: 20px;\n}',
  },
} satisfies typeof ja;
