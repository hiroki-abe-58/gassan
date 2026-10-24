import type ja from '../ja/layout';

export default {
  lead: 'Width comes from tokens, height from CSS Grid and dvh. No height is computed in JS. Only the body scrolls.',
  size: {
    title: 'Width tokens',
    intro: 'The panel width is min(100%, token). It never overflows on narrow screens and keeps a readable line length on wide ones.',
  },
  placement: {
    title: 'Placement',
    intro: 'placement="auto" is resolved to center or sheet in JS before it reaches the DOM. start and end are panels that slide in from the side edges; choose them by purpose (auto never resolves to them).',
    mockTitle: 'Route',
    when: {
      center: 'Default on desktop',
      top: 'When the content height changes a lot. Centered, the panel would jump up and down as the height changes',
      sheet: 'Default below 600px wide. Puts primary within one-handed reach',
      start: 'A navigation drawer. Opens the app’s navigation on narrow screens',
      end: 'A panel for details or filters. Check the contents while keeping the list in view',
    },
  },
  grid: {
    title: 'The panel grid',
    intro: 'Three rows: header, body and footer. Unless the body row is minmax(0, 1fr), the body does not shrink and never scrolls.',
    code: '.g-panel {\n  inline-size: min(100%, var(--g-panel-max));\n  max-block-size: 100%;           /* never 100vh */\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n}\n.g-header { grid-row: 1; }\n.g-body   { grid-row: 2; overflow: auto; overscroll-behavior: contain; }\n.g-footer { grid-row: 3; }',
    codeCaption: 'The idea (the actual rules are in src/styles.css)',
    mockTitle: 'Changelog',
    mockClose: 'Close',
    do: 'Only the body scrolls. The header and footer are always visible (B-01 / H-10).',
    mockCut: 'The title is cut off at the top of the screen',
    dont: 'Do not settle for `max-h-[90vh]` or a bare `1fr`. The mobile address bar breaks the height, and with centering the top edge gets cut off.',
  },
  touch: {
    title: 'Touch target size',
    body: (tap: string): string =>
      `The target for buttons and icon buttons is \`${tap}\`. WCAG 2.5.8 sets a minimum of 24px, but gassan adopts the 44px of Apple’s HIG. Leave at least 8px between “Back” and “×”: mixing up those two is the costliest accident of all (H-03 / H-04).`,
    callout: 'Always wrap the safe area in `max()`, so the padding does not vanish on devices where `env(safe-area-inset-bottom)` is 0 (C-04 / F-12).',
  },
  spec: {
    title: 'Container items',
    tableCaption: 'Container specification',
  },
} satisfies typeof ja;
