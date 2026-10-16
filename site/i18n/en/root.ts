import type ja from '../ja/root';

export default {
  lead: 'The container for layers 1–3. It leaves the top layer, focus and Esc to <dialog> and showModal(), places the scrim, panel and live region, and funnels every close request, with its reason, into a single path.',
  playground: {
    title: 'What the kind decides',
    intro: 'Change kind, size, placement and scrim, then open it. When closing is not allowed, pressing Esc or the backdrop shakes the panel and announces the reason.',
    exampleTitle: 'Modal.Root playground',
  },
  reasons: {
    title: 'Close reasons',
    intro: 'onOpenChange(false, reason) always comes with a reason, so you can branch on it, for example “save a draft only when closed with Esc”.',
    tableLabel: 'List of close reasons',
    tableCaption: 'The 8 kinds of CloseReason',
    from: 'Source',
    refuse: 'How to refuse',
    rows: {
      esc: { from: 'The Esc key. The native cancel is always stopped and routed here', refuse: 'dismiss.esc / onRequestClose' },
      backdrop: { from: 'Pressing the scrim. Only when both the press and the release are on the scrim', refuse: 'dismiss.backdrop / onRequestClose' },
      'close-button': { from: 'Modal.Close, or a button with closeOnClick="close-button"', refuse: 'onRequestClose' },
      'back-button': { from: 'The browser back button with closeOnBack (only the topmost modal responds)', refuse: 'onRequestClose' },
      submit: { from: 'A button with closeOnClick="submit", or <form method="dialog">', refuse: 'onRequestClose (when triggered by a button)' },
      programmatic: { from: 'dialog.close() was called from outside', refuse: '— (already closed; only cleanup runs)' },
      swipe: { from: 'A downward flick on a sheet (swipeToDismiss)', refuse: 'dismiss.backdrop / onRequestClose' },
      'route-change': { from: 'routeKey changed (with Next.js, pass usePathname())', refuse: 'onRequestClose' },
    },
  },
  guard: {
    title: 'Holding it open',
    intro: 'If onRequestClose returns false (or a Promise that resolves to false), the modal stays open. A refusal is never silent: the panel shakes and the reason is announced.',
    exampleTitle: 'Holding open a half-filled form',
    exampleDescription: 'Type something, then press Esc or ×. A confirmation stacks on top.',
  },
  mount: {
    title: 'Always mounted, and the cleanup',
    body: [
      'The modal is always rendered and opened and closed with `open`. On a close request it adds `data-exiting`, draws the exit, waits `--g-dur-out`, then calls `close()`. Resetting the content (`resetOnClose`), restoring focus, releasing the scroll lock and `onExited` all happen after `close()`.',
    ],
    callout:
      'Modals can be nested (L-11). So that Esc or Cmd/Ctrl + Enter in the inner modal never reaches the outer one, events pass only when the nearest dialog is the modal itself. Even with two stacked, the scrim stays as dense as a single one (L-12).',
  },
  a11yBody: [
    '`showModal()` traps focus, makes the background inert, handles Esc and restores focus. What Root takes on itself is wiring up the name, a single live region, where initial focus goes, and funneling every way of closing into one path.',
  ],
  a11yCaption: 'Specification items Modal.Root satisfies',
} satisfies typeof ja;
