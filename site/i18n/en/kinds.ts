import type ja from '../ja/kinds';

export default {
  lead: 'Before building, pick which one of these you are about to build. Once the kind is set, the decision matrix settles the scrim, placement, dismissal and footer order automatically.',
  kinds: {
    title: 'The five kinds',
    intro: 'If a modal fits more than one kind, it is really two modals that should be split.',
    tableCaption: 'The five kinds of modal',
  },
  live: {
    title: 'Try them',
    intro: 'Each one is real gassan. In a kind that does not allow closing, press Esc or the backdrop: the panel shakes and the reason is announced.',
    confirm: {
      title: 'confirm — Confirmation',
      description: 'Small and centered. Closes with Esc or the backdrop.',
    },
    form: {
      title: 'form — Input',
      description: 'A backdrop click does not close it. Unsaved input holds it open.',
    },
    view: {
      title: 'view — Viewing',
      description: 'A lightbox with the immersive scrim. Arrow keys move between items.',
    },
    consent: {
      title: 'consent — Consent',
      description: 'primary cannot be pressed until the content is read and consent is given. Pressing it returns the reason.',
    },
    flow: {
      title: 'flow — Flow',
      description: 'Three slots: back, current step and close.',
    },
  },
  scrim: {
    title: 'Scrim',
    body: [
      'The default is 32% black with no blur. 60–80% black kills the context behind, throwing away the one advantage a modal has. The four intent-based levels and the conditions under which blur is allowed are covered on the [Scrim](#/styles/scrim) page.',
    ],
  },
  placement: {
    title: 'Placement',
    tableCaption: 'Placement conditions',
    callout:
      '`placement="auto"` is resolved to `center` or `sheet` in JS (matchMedia) before it reaches the DOM. Branching with CSS media queries would mean keeping two copies of the per-placement `@starting-style`, and one of them always goes stale.',
  },
  dismiss: {
    title: 'Which ways close it',
    intro: '○ closes, ✕ does not close, △ closes conditionally (for example, after confirming unsaved changes).',
    tableCaption: 'Dismissal by kind',
    mockTitle: 'Updated terms of service',
    mockNote: 'This dialog cannot be closed yet',
    do: 'Even when closing is not allowed, treat Esc and backdrop clicks as a clear signal that the user wants to close. Shake the panel and announce the reason with `role="status"` (L-10).',
    dont: 'Do not ignore it silently. If nothing happens, the user concludes it is broken.',
  },
  footer: {
    title: 'Footer button order',
    intro: 'DOM order = visual order = Tab order = reading order. Do not reverse it on narrow screens either.',
    orderTitle: 'Publish the article',
    cancel: 'Cancel',
    draft: 'Save draft',
    publish: 'Publish',
    orderDo: 'On narrow screens, stack the buttons vertically in DOM order. To put primary on top, change the DOM order itself, not the CSS.',
    orderDont:
      'Do not swap them only visually with `column-reverse` or `order`. Tab and reading order then run opposite to the visual order (WCAG 1.3.2 / 2.4.3).',
    dangerTitle: 'Delete project',
    dangerCancel: 'Cancel',
    dangerDelete: 'Delete',
    dangerDo: 'For a destructive action, keep the usual primary position and change only the color to danger (F-06).',
    dangerDont: 'Do not change color and position at the same time. Muscle memory misses, which causes more mistakes, not fewer.',
  },
  gates: {
    title: 'Choosing an activation gate',
    intro: 'Only a few conditions justify a button that cannot be pressed. Making users wait out a timer, or judging by scroll position alone, is prohibited.',
    tableCaption: 'Conditions allowed for a gate',
    more: '[How to use activation gates →](#/components/gate)',
  },
} satisfies typeof ja;
