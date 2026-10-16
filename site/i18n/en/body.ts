import type ja from '../ja/body';

export default {
  lead: 'The only scroll area in the modal. It can take focus so it can be read with a keyboard, and it has a name. The read gate attaches here too.',
  scroll: {
    title: 'Only the body scrolls',
    intro: 'The header and footer are fixed. Shadows appear at the top and bottom until the body reaches its edges.',
    exampleTitle: 'Changelog',
    exampleDescription: 'Tab into the body, then scroll with the arrow keys, PageDown or Space.',
  },
  focusable: {
    title: 'A focusable scroll area',
    body: [
      'Browsers other than Firefox do not make scrollable elements focusable on their own. Users without a mouse never reach the body and cannot read it. gassan’s body has `tabIndex={0}`, `role="group"` and an accessible name. It never creates a focusable element without a name (B-02 / B-03).',
    ],
    mockTitle: 'Changelog',
    do: 'Tab into the body and read it with the keys. Give it a name with label, such as “Changelog content”.',
    dont: 'Do not settle for a bare `<div className="overflow-y-auto">`. It becomes an area keyboard users cannot read.',
  },
  readGate: {
    title: 'Read gate',
    body: [
      'Pass `readGate="read"`, and whether the content has been read is registered as a named gate. It is judged as the logical OR of “the end came into view”, “focus reached the end” and “no scrolling needed in the first place”, and once satisfied it is never revoked. While the modal is closed, its size is 0, so nothing is judged (§10-1). Usage is covered in [Activation gates](#/components/gate).',
    ],
  },
  a11yCaption: 'Specification items the body satisfies',
} satisfies typeof ja;
