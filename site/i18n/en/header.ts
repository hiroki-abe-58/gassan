import type ja from '../ja/header';

export default {
  lead: 'The header is pinned to the first grid row. The controls sit in three slots — back, current step and close — on a row separate from the title.',
  slots: {
    title: 'The three slots',
    intro: 'Back goes in start, the current step in center, close in end. The grid is 1fr auto 1fr, so the center does not shift whether or not back is present.',
    exampleTitle: 'Checkout (3 steps)',
    exampleDescription: 'Move on with “Next” and back appears on the left. The “1 / 3” in the center stays where it is.',
  },
  titleRow: {
    title: 'Do not put the title on the controls row',
    mockTitle: 'Checkout — choose a payment method',
    do: 'The controls and the title are on separate rows. However long the title grows, it never runs into back and close (H-05).',
    mockCrowded: 'Checkout — choose a payme…',
    dont: 'Do not squeeze the title between back and close. Long text always collides, and the distance that prevents mis-taps shrinks.',
  },
  indicator: {
    title: 'Announcing the current step',
    body: [
      'The “2 / 3” of `Modal.Indicator` is for the eyes; read as is, it becomes “2 slash 3”. The visual version is `aria-hidden`, and a separate “Step 2 of 3” is kept for screen readers. A step change is announced (H-06).',
      'Icon-only buttons get the names “Back” and “Close” (A-07). The text can be replaced with `GassanProvider`.',
    ],
  },
  a11yCaption: 'Specification items the header and controls satisfy',
} satisfies typeof ja;
