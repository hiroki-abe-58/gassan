import type ja from '../ja/field';

export default {
  lead: 'Modal.Field wires a name, help and error to a single input, and Modal.Fieldset to a group of options. The control inside can be a gassan input component, a native input, or a component from another library.',
  field: {
    title: 'Wiring in one place',
    intro: 'A render prop passes the id and aria-*. gassan’s input components take them by simply spreading them.',
    exampleTitle: 'Invite a member',
    exampleDescription: 'Press “Invite” with the fields empty: a summary appears in one place, and focus moves to the first error.',
  },
  parts: {
    title: 'gassan’s input components',
    tableCaption: 'Input components and the pages that cover them',
    head: { page: 'Page', parts: 'Components' },
    body: [
      'Every component is a native element underneath; only the frame and the marks are redrawn. Keyboard interaction, screen reader announcements, form submission and the dedicated mobile UIs all come straight from the browser. Only the select, combobox and calendar, where native controls fall short, are built from scratch to the WAI-ARIA APG patterns (I-01 to I-15).',
      'There is no multi-select combobox or date range selection yet. When you need one, wrap a component from another library in Modal.Field the same way. For popups inside a modal, the panel’s `transform` breaks `position: fixed`, so use the popover API or a portal into the dialog (C-12). Minimal examples are in [docs/control-recipes.md](./docs/control-recipes.md).',
    ],
  },
  errors: {
    title: 'Showing errors',
    callout:
      'Do not put `role="alert"` on individual errors. If an announcement interrupts on every keystroke, typing becomes harder, not easier. Put only the summary at submit time in `Modal.Alert`, and move focus to the first field with an error (B-09).',
  },
  apiControl: 'Render prop argument',
  apiAria: 'Wiring the input components accept (when naming them outside a Field)',
  a11yCaption: 'Specification items the form parts satisfy',
} satisfies typeof ja;
