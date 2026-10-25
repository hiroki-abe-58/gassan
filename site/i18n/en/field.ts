import type ja from '../ja/field';

export default {
  lead: 'Modal.Field wires a name, help and error to a single input, and Modal.Fieldset to a group of options. The control inside can be a gassan input component, a native input, or a component from another library.',
  field: {
    title: 'Wiring in one place',
    intro: 'A render prop passes the id and aria-*. gassan’s input components take them by simply spreading them.',
    exampleTitle: 'Invite a member',
    exampleDescription: 'Press “Invite” with the fields empty: a summary appears in one place, and focus moves to the first error.',
  },
  floating: {
    title: 'Floating labels',
    intro:
      'labelPlacement="floating" puts the label inside the input’s frame. With focus or a value, the label shrinks out of the way to the top left, and the text goes on the line below it. CSS decides from the input’s focus and value whether the label floats or rests, so it always matches the value on screen: controlled or uncontrolled, with an initial value, after a form reset, with autofill, or during IME composition.',
    signInTitle: 'Sign-in fields',
    signInDescription:
      'Focus a field with a click or Tab, and the label shrinks to the top left with the caret below it. Move focus away while the field is empty, and the label returns to the middle; type something first, and it stays floating. Press “Continue” with nothing entered: an error appears, and focus returns to the field.',
    statesTitle: 'Initial values, errors and disabled fields',
    statesDescription:
      'A field with an initial value is floating from the first render. Fix the email address, and the error goes away. “Reset to initial values” is a form reset, so even a field you cleared goes back to how it was, label and all.',
    modalTitle: 'Inside a modal',
    modalDescription: 'Modal.Field takes the same prop.',
    notes: [
      'The label stays a real `<label>`, so the input’s accessible name is always the label’s text. Floating or resting, the wiring of the name, the description (help and error) and required (`aria-required`) is the same as with a label on top, and no announcement cuts in while the label moves.',
      'Only an `Input` or `PasswordInput` with nothing at its start can hold the label inside (a unit at the end, or the visibility toggle, is fine). With an `Input` that has a symbol at its start, a `Select` and the like, the field renders with the label on top. A placeholder, if you pass one, shows only while the label is out of the way (while the field has focus and is empty).',
      'Only the label’s position and size change, over `--g-dur-fast` (it follows the motion level and stops under the “Reduce Motion” setting). Text that overshoots and comes back is hard to read, so the label does not spring even at the expressive level.',
    ],
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
