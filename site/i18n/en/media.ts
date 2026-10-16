import type ja from '../ja/media';

export default {
  lead: 'Images, video and audio, plus a gallery to move through them sideways. The aspect ratio is reserved up front to remove layout jumps, and nothing autoplays. The gallery is really scroll-snap; the buttons and keys only say which position to go to.',
  gallery: {
    title: 'Gallery',
    intro: 'Previous and next buttons, arrow keys, Home / End or scrolling with a finger: whichever moves it, they all point to the same position. The position is announced.',
    exampleTitle: 'Ridgeline studies',
    exampleDescription: 'Once open, move with ← →. The “n / 5” in the title is updated by onIndexChange.',
  },
  media: {
    title: 'Media defaults',
    body: [
      'Pass `ratio="16 / 9"`, and the space is reserved before loading. If the height changed after loading, the modal would jump (B-10). The ratio applies to the inner `img` / `video`, not to the `figure` that includes the caption (§10-7).',
      'Video and audio have no `autoplay`, have `controls`, and use `preload="metadata"`. Sound starting the moment a modal opens betrays the intent of “please focus on this now” (B-11).',
    ],
    callout: 'Forget to pass `alt` to an image, and you get a warning during development. For decorative images, set `alt=""` explicitly.',
  },
  notify: {
    title: 'Position notifications',
    body: [
      '`onIndexChange` fires only when the position the user sees changes. Mounting alone does not fire it. When `items` shrinks and the position gets clamped, that counts as a change, so it fires (D-14). If `items[].id` has duplicates, the warning names the value (D-13).',
    ],
  },
  a11yCaption: 'Specification items media and the gallery satisfy',
} satisfies typeof ja;
