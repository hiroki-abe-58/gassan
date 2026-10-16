import type ja from '../ja/motion';

export default {
  lead: 'Both entry and exit are drawn in CSS alone. No JS animation library. JS has only one job: wait to call close() until the exit has been seen.',
  durations: {
    title: 'Duration',
    intro: 'Exit is faster than entry. People can wait for something to open, but not for it to close.',
    in: 'Entry',
    out: 'Exit',
    replayClose: 'Close (120ms)',
    replayOpen: 'Open (180ms)',
  },
  easing: {
    title: 'Easing',
    in: 'Entry (decelerates to a stop)',
    out: 'Exit (accelerates away)',
  },
  exit: {
    title: 'Exit animations and overlay',
    body: [
      'Drawing the exit in CSS hinges on two things: `transition-behavior: allow-discrete` and `overlay`. But `overlay` is not Baseline yet. In browsers without it, the dialog leaves the top layer and disappears the instant `close()` is called.',
      'So when gassan receives a close request, it does not call `close()`; it adds `data-exiting` and transitions to the exit state with the dialog still open. It calls `close()` only after waiting `--g-dur-out`. The wait is read from the CSS token, so JS never keeps a second copy of the same number (L-07).',
    ],
  },
  reduced: {
    title: 'Reduced motion',
    callout:
      'Under `prefers-reduced-motion: reduce`, fades take 1ms. Not 0: at 0, discrete transitions (`display` and `overlay`) break (S-05). The exit wait drops to 0 too, but it goes through the same code path.',
    tableCaption: 'Motion specification',
  },
} satisfies typeof ja;
