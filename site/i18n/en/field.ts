import type ja from '../ja/field';

export default {
  lead: 'Modal.Field takes on only the wiring of label, help and error; it does not build the input itself. Chips, Switch, Table and Alert cover only the parts that modals often need and that are easy to wire up wrong.',
  field: {
    title: 'Wiring in one place',
    intro: 'A render prop passes the id and aria-*. The input inside can be a native input or a component from another library.',
    exampleTitle: 'Invite a member',
    exampleDescription: 'Press “Invite” with the fields empty: a summary appears in one place, and focus moves to the first error.',
  },
  delegate: {
    title: 'Do not build your own controls',
    tableCaption: 'Where each input control comes from',
    head: { control: 'Control', use: 'What to do' },
    rows: [
      { control: 'range / date / time / file / select', use: 'Wrap the native input in Modal.Field as is' },
      { control: 'Radios, multiple checkboxes', use: 'Name them with fieldset and legend (not label)' },
      { control: 'Searchable select, combobox, two-thumb slider', use: 'Leave them to a dedicated library such as Base UI' },
    ],
    body: [
      'Minimal examples of each are in [docs/control-recipes.md](./docs/control-recipes.md). For popups inside a modal, the panel’s `transform` breaks `position: fixed`, so use the popover API or a portal into the dialog (C-12).',
    ],
  },
  errors: {
    title: 'Showing errors',
    callout:
      'Do not put `role="alert"` on individual errors. If an announcement interrupts on every keystroke, typing becomes harder, not easier. Put only the summary at submit time in `Modal.Alert`, and move focus to the first field with an error (B-09).',
  },
  apiControl: 'Render prop argument',
  a11yCaption: 'Specification items the form parts satisfy',
} satisfies typeof ja;
