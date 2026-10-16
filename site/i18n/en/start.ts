import type ja from '../ja/start';

export default {
  lead: 'Install it, pick one kind, and keep it mounted. That is all there is to remember; the kind takes care of the remaining decisions.',
  install: {
    title: 'Installation',
    body: ['Published on npm (`@genelab/gassan`). The peer dependency is React 18.2 or later (19 works too).'],
    nextjs:
      'For the Next.js App Router, the bundle already starts with `"use client"`, so you can import it as is. To close on page navigation, pass `routeKey={usePathname()}` (L-13).',
  },
  minimal: {
    title: 'Minimal example',
    intro: 'Three rows: header, body and footer. Modal.Title takes care of the name, and Modal.Field wires up the label and description.',
    exampleTitle: 'Edit profile',
  },
  alwaysMounted: {
    title: 'Keep the modal mounted',
    body: [
      'The closing animation assumes the element is still there after closing. With conditional mounting, the element disappears the moment `open` turns false, so there is simply nothing left to draw the exit on.',
    ],
    do: 'Keep it mounted and open and close it with `open`. The library runs the exit animation, focus restoration and content reset in order.',
    dont: 'Do not write `{open && <Modal.Root />}`. The modal vanishes the instant it closes, and the exit animation cannot be drawn (§5, item 3).',
  },
  choose: {
    title: 'Pick one kind',
    body: [
      'There are 5 `kind`s: `confirm` / `form` / `view` / `consent` / `flow`. The choice sets the defaults for the scrim, whether Esc and backdrop clicks close the modal, and the placement. If a modal fits more than one kind, it is really two modals that should be split.',
    ],
    doTitle: 'Delete this draft?',
    doCancel: 'Cancel',
    doDelete: 'Delete',
    do: 'One purpose per modal. A confirmation only confirms.',
    dontTitle: 'Delete this? Also, settings',
    dontSave: 'Save and delete',
    dont: 'Do not mix a confirmation and a form in one modal. There are then two right ways to close it, and one of them always lets the user down.',
    more: 'The 5 kinds and the decision matrix →',
  },
  imperative: {
    title: 'For a simple confirmation, just await it',
    body: [
      'Writing a confirmation dialog declaratively adds state. `useModals().confirm()` returns the result as a Promise. Put exactly one `<ModalHost />` at the root of your app.',
    ],
    code: "const modals = useModals();\nconst ok = await modals.confirm({ title: 'Delete this?', tone: 'danger' });",
  },
  browsers: {
    title: 'Browser requirements',
    intro:
      'Since layer 1 is left to the browser, the current state of browsers is a direct prerequisite. In older environments it degrades to a modal without animation; opening, closing and accessibility are preserved.',
    tableCaption: 'Platform features used, and their support',
  },
  ai: {
    title: 'When an AI writes the code',
    intro:
      'Give Cursor / Claude Code / Copilot only this block from §9 of the specification. It heads off the habits of pre-2022 implementations (hand-rolled focus traps, z-index: 9999, conditional mounting).',
  },
} satisfies typeof ja;
