import type ja from '../ja/footer';

export default {
  lead: 'Footer buttons go up to three levels. Write them so that DOM order = visual order = Tab order, and double submission becomes impossible by design.',
  hierarchy: {
    title: 'Button hierarchy',
    intro: 'One each of primary, secondary and tertiary. Write them weakest first, and only the first tertiary moves away to the left.',
    exampleTitle: 'Publish the article',
    exampleDescription: 'Mash “Publish” and it still runs only once. ⌘ / Ctrl + Enter presses primary too.',
  },
  loading: {
    title: 'Loading',
    body: [
      'When `onAction` returns a Promise, the button stays loading until it settles. Clicks in the meantime are swallowed, so double submission is impossible by design. A `loading` passed from outside is combined with the internal loading state by **logical OR**, because `loading={false}` means “not loading for my own reasons”, not “allow presses even during onAction” (F-08).',
      'While loading, the label is hidden with `opacity: 0` and a spinner is laid over it. `visibility: hidden` would remove the name with it, leaving a button with no name (F-07 / §10-4). The width does not change either.',
    ],
    callout: 'Even if `onAction` rejects, the loading state is always cleared. No button gets stuck unpressable.',
  },
  danger: {
    title: 'Destructive actions',
    mockTitle: 'Delete project',
    mockCancel: 'Cancel',
    mockDelete: 'Delete',
    do: '`variant="danger"` stays in the primary position and changes only the color.',
    dont: 'Do not put initial focus on a destructive button. A single Enter would do something irreversible (K-05).',
  },
  a11yCaption: 'Specification items the footer and buttons satisfy',
} satisfies typeof ja;
