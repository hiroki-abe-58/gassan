import type ja from '../ja/sheet';

export default {
  lead: 'placement="sheet" turns the panel into one that slides up from the bottom. Pass detents, and it stops at peek / half / full. The handle is not decoration but a control, operable with a keyboard too.',
  detents: {
    title: 'A sheet that stops at detents',
    intro: 'Drag the handle, or focus it and press ↑ ↓ to move between detents. The current detent arrives through onDetentChange.',
    exampleTitle: 'Route to Mt. Gassan',
    exampleDescription: 'Try it with a finger on a narrow screen, or with the keyboard and clicks on a wide one.',
  },
  rules: {
    title: 'Three rules',
    items: [
      {
        title: 'A fast downward flick does not close the sheet. It drops one detent',
        body: 'When there are detents, people flick meaning “a bit smaller”. The sheet closes only when flicked further down from the lowest detent.',
      },
      {
        title: 'The handle is not drag-only',
        body: 'With detents it becomes role="slider", and arrow keys, Home / End and clicks move between detents too. People who cannot drag are not left without a way.',
      },
      {
        title: 'Without detents, the sheet is as tall as its content',
        body: 'The handle falls back to decoration (aria-hidden). Something that cannot be moved is never announced as a control.',
      },
    ],
  },
  release: {
    title: 'After the finger lifts',
    body: [
      'What the browser does on its own after the finger lifts breaks more easily than the drag detection itself. The synthetic click right after a drag moves the detent twice; releasing outside the panel freezes it; returning to the same detent drops the height — each of these was actually hit, fixed and pinned down with tests (§10-13 to §10-15).',
    ],
    callout:
      'Deciding where to snap is factored out into the pure functions `resolveDetents` / `snapToDetent`, which can be imported on their own, so that it can be verified even in test environments without layout.',
  },
  api: {
    body: [
      'The detents themselves are set with `detents` / `defaultDetent` / `onDetentChange` / `swipeToDismiss` on `Modal.Root` ([Modal.Root API](#/components/root/api)).',
    ],
  },
  a11yCaption: 'Sheet and mobile specification',
} satisfies typeof ja;
