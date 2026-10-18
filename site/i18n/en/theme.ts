import type ja from '../ja/theme';

export default {
  lead: 'Switch the appearance (light or dark), the background tint and the primary color freely. Whichever color you pick, it is derived so that text and fills never drop below the WCAG requirements.',
  checksTable: {
    sample: 'Sample',
    pair: 'Pair',
    ratio: 'Ratio',
    min: 'Minimum',
    pass: (min: number): string => `Pass (${String(min)}:1 or more)`,
    fail: (min: number): string => `Fail (below ${String(min)}:1)`,
  },
  controls: {
    title: 'Switch',
    intro: 'These are the same settings as “Theme” at the top of the page. They apply to the whole site and to the modal demos.',
  },
  now: {
    title: 'Current theme',
    intro: 'The four accent colors and four background colors derived from your choice, and the contrast ratios of the pairs that use them. This table is computed from the current settings. Site text is measured on the surface it can sit on with the lowest ratio.',
    tones: {
      accent: 'Accent (fills, links, focus)',
      onAccent: 'Text on the accent',
      soft: 'Soft surface',
      onSoft: 'Text on the soft surface',
      bg: 'Page background',
      surface: 'Card surface',
      surface1: 'Surface sunken one level',
      modal: 'Modal surface',
    },
    tableCaption: 'Contrast ratios of the current theme',
  },
  presets: {
    title: 'All presets',
    intro: 'The seed color, and the colors actually used in light and dark. The number on the right is the ratio of the pair with the least margin in that theme. The background tint follows the current setting.',
    tableLabel: 'Preset verification',
    tableCaption: 'Colors per preset, and the ratio of the tightest pair',
    preset: 'Preset',
    seed: 'Seed color',
    light: 'Light',
    dark: 'Dark',
    current: 'Selected',
    pass: 'All pass',
    fail: 'Some fail',
    withTightest: (verdict: string, ratio: string, min: number): string =>
      `${verdict} · min ${ratio}:1 (requirement ${String(min)}:1)`,
    body: [
      'The tests also run every combination (`tests/theme.test.ts`). Beyond the presets, they check that for every color across 24 hues × 5 lightness steps × 4 chroma steps, every item meets the requirement for all three background tints in both light and dark, the hue does not shift, and neighboring presets stay distinguishable.',
    ],
  },
  how: {
    title: 'How the colors are derived',
    rules: [
      {
        title: 'Keep the hue, move only the lightness',
        body: 'The chosen color is converted to OKLCH (a color space close to how the human eye perceives color), and its lightness is moved while hue and chroma are kept. Darkening in RGB shifts the hue, making yellow look green or brown.',
      },
      {
        title: 'Reach 4.5:1 against every surface',
        body: 'The accent is also used for links and selected text, so it is moved until it reaches 4.5:1 against the page background, the surface, the sunken surfaces and the soft surface. Darker in light mode, lighter in dark mode. It stops at the lightness closest to the seed.',
      },
      {
        title: 'Text is white in light mode, dark in dark mode',
        body: 'A color that reaches 4.5:1 against the surfaces is guaranteed to reach 4.5:1 or more against white text in light mode, and against text darker than any surface in dark mode. The text on filled buttons is guaranteed by calculation.',
      },
      {
        title: 'Aim for 7:1 for text on soft surfaces',
        body: 'Soft surfaces carry long text, such as the selected navigation item or supplementary callouts, so the target is AAA rather than AA.',
      },
      {
        title: 'Mix the primary hue into the background',
        body: '“Soft” mixes a faint trace of the hue into surfaces and lines without changing their lightness. “Strong” adds more chroma and shifts them darker in light mode and lighter in dark mode, so the page becomes a colored surface. Card and modal surfaces take less color so they float above the background. Text has its lightness moved until it reaches 4.5:1 on the tinted surfaces too. The darker the surfaces get, the narrower the lightness range in which the accent can pass, so neighboring presets move slightly closer together with “Strong”.',
      },
    ],
    callout: (yellowHue: number, limeHue: number): string =>
      `Bright hues such as yellow and yellow-green get darkened to mustard and olive in light mode to reach 4.5:1 on a white surface. Readability was put ahead of freedom of color. In dark mode they keep their original vividness. Since “Lime yellow” sits between “Yellow” and “Yellow-green”, “Yellow-green” is pushed out to a hue of ${String(limeHue)}° so that neighbors stay distinguishable even after darkening in light mode. Compare them in the preset table, starting from “Yellow” at a hue of ${String(yellowHue)}°.`,
  },
  own: {
    title: 'Change the colors in your own app',
    intro: 'The colors of gassan’s modals change just by overriding custom properties. Write them outside @layer, and specificity is no concern.',
    code: (accent: string, onAccent: string, tinted: string): string =>
      `:root {\n  --g-accent: ${accent};     /* primary fill, switches, selected chips */\n  --g-on-accent: ${onAccent};  /* text on top of it */\n  --g-focus: ${accent};      /* focus ring */${tinted}\n}`,
    tintedComment: 'background tint (surfaces, borders, text)',
    body: [
      'The values above are derived from the theme you have selected. When you choose your own colors, check the ratios of the same pairs as the tables on this page (accent with on-accent, and accent and focus against the surfaces).',
    ],
  },
} satisfies typeof ja;
