import type ja from '../ja/common';

export default {
  siteTitle: 'gassan — a modal shell for the native dialog',
  skipToMain: 'Skip to main content',
  openMenu: 'Open menu',
  menu: 'Menu',
  menuBody: 'Pages on this site',
  siteNav: 'Site',
  home: 'Home',
  spec: 'Specification',
  pager: 'Previous and next pages',
  prev: 'Previous',
  next: 'Next',
  footerCompliance: (version: string, updated: string): string =>
    `Conforms to [specification v${version} (${updated})](#/spec)`,
  footerGenerated:
    'Every table, count and API description is generated at build time from the specification and the type definitions. No number is written by hand.',
  originalNote:
    'This site is translated from Japanese. Text taken from the specification (`modal.skill.md`) — behavior names and summaries, implementation notes, API descriptions and verification records — is shown in the original Japanese.',

  lang: {
    button: 'Language',
    title: 'Display language',
  },

  theme: {
    button: 'Theme',
    close: 'Close',
    scheme: 'Appearance',
    schemes: { light: 'Light', dark: 'Dark', system: 'Match system' },
    background: 'Background',
    tints: { neutral: 'Neutral', soft: 'Soft', strong: 'Strong' },
    motion: 'Motion',
    motions: { none: 'None', subtle: 'Subtle', standard: 'Standard', expressive: 'Expressive' },
    primary: 'Primary color',
    presets: {
      default: 'Default',
      magenta: 'Magenta',
      red: 'Red',
      salmon: 'Salmon pink',
      vermilion: 'Red-orange',
      amber: 'Amber',
      yellow: 'Yellow',
      'lime-yellow': 'Lime yellow',
      lime: 'Yellow-green',
      green: 'Green',
      teal: 'Teal',
      blue: 'Blue',
      indigo: 'Indigo',
      custom: 'Custom color',
    },
    pickCustom: 'Pick a custom color',
    summaryPass: (count: number, worst: string): string =>
      `All ${String(count)} text and fill pairs meet the WCAG requirements (even the tightest pair is ${worst}× the minimum)`,
    summaryFail: 'Some pairs fall short of the requirements',
    more: 'How the chosen color is adjusted →',
    checks: {
      linkBg: 'Links and selected text (page background)',
      linkSurface: 'Links and selected text (surface)',
      linkSurface1: 'Links and selected text (surface sunken one level)',
      linkSurface2: 'Links and selected text (surface sunken two levels)',
      linkSoft: 'Links (on a soft surface)',
      onAccent: 'Text on filled buttons',
      onSoft: 'Text on soft surfaces (targeting AAA)',
      ink: 'Body text (on the surface with the lowest ratio)',
      ink2: 'Secondary text (on the surface with the lowest ratio)',
      ink3: 'Subtle text (on the surface with the lowest ratio)',
      do: 'Text in the “Do” color (on the surface with the lowest ratio)',
      dont: 'Text in the “Don’t” color (on the surface with the lowest ratio)',
      caution: 'Text in the “Caution” color (on the surface with the lowest ratio)',
      gassanPrimary: 'Modal primary button text',
      gassanGated: 'Modal primary button text while gated',
      gassanBody: 'Modal body text',
      gassanMuted: 'Modal secondary text and tertiary',
      gassanDanger: 'Modal error text',
      gassanSuccess: 'Toast success icon',
      gassanWarning: 'Toast warning icon',
      gassanInfo: 'Toast info icon',
      gassanSunday: 'Calendar Sundays and holidays',
      gassanSaturday: 'Calendar Saturdays',
      focusRing: 'Focus ring (non-text)',
      fill: 'Switch and selected chip fills (non-text)',
    },
  },

  code: {
    copy: 'Copy',
    copied: 'Copied',
    copiedStatus: 'Code copied',
    label: 'Code',
    labelOf: (caption: string): string => `Code for ${caption}`,
  },

  example: {
    show: 'Show code',
    hide: 'Hide code',
  },

  keyPoint: { caution: 'Caution' },

  component: {
    eyebrow: 'Component',
    tabs: 'On this page',
    overview: 'Overview',
    api: 'API',
    a11y: 'Accessibility',
  },

  specChips: 'Specification items covered on this page',

  guideline: { do: 'Do', dont: "Don't", caution: 'Caution' },

  mock: { heading: "This month's sales" },

  specTable: {
    id: 'ID',
    behavior: 'Behavior',
    priority: 'Level',
    summary: 'Implementation summary',
    status: 'Status',
  },
  priority: { M: 'Must', S: 'Should', O: 'Optional' },
  status: {
    実装: 'Implemented',
    実機: 'On device',
    記述: 'Described',
    未検証: 'Unverified',
    委譲: 'Delegated',
    合成: 'Composed',
    ロードマップ: 'Roadmap',
  },

  api: {
    name: 'Name',
    type: 'Type',
    default: 'Default',
    description: 'Description',
    required: 'Required',
    none: 'None',
    propsOf: (name: string): string => `${name} props`,
    passthrough:
      '`data-*` is passed straight through to the host element (D-11). Other hyphenated props, such as `aria-*`, trigger a warning and are dropped.',
    inherits: (name: string): string => `Inherits \`${name}\`.`,
  },

  table: 'Table',

  contrastSample: 'Aa',

  breakCompare: {
    browser: 'Browser default',
    browserNote: 'Breaks between any two characters',
    phraseNote: 'Breaks at phrase boundaries',
  },

  layers: {
    layer: (n: number): string => `Layer ${String(n)}`,
    tokens: 'CSS tokens',
  },

  notFound: {
    title: 'Page not found',
    lead: 'The link is out of date, or the address is wrong.',
    back: 'Back to home',
  },
} satisfies typeof ja;
