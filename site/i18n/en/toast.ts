import type ja from '../ja/toast';

export default {
  lead: 'A notification that tells people a task is done without getting in the way of their work. Call `toast()`, and it appears at the edge of the screen; the meter along its bottom edge shrinks as time runs down, and it closes when time is up. It can also be closed with ×, Esc or a sideways swipe. Even while a modal is open, it appears above the modal and can still be pressed.',
  tones: {
    title: 'Examples',
    intro: 'Icons and colors come in four tones, success, info, warning and error, plus a default with no icon. Color goes only on the icon and the meter, and the surface stays the same as other components (no boxed emphasis).',
    exampleTitle: 'Tones compared',
    exampleDescription: 'Press a button, and a toast appears at the bottom right. The meter stops while the pointer is over it.',
  },
  meter: {
    title: 'The time-left meter',
    intro: 'The line along the bottom edge shrinks in proportion to the time left. A faint track shows the full length, so you can tell at a glance how long until it disappears.',
    body: [
      'While the pointer is over it, while focus is inside it, while the tab is hidden, and while a finger is dragging it, both the timer and the meter stop. It never disappears while someone is still reading (WCAG 2.2.1 / 2.2.2). The count resumes from the time that was left before it stopped.',
      'The meter is information that tells you the time left, so it keeps moving even with the motion level set to `none`. With the OS “Reduce Motion” setting, it does not shrink smoothly but steps down once a second.',
      'Change the time with `duration` (ms). Pass `Infinity`, and it never closes on a timer and shows no meter.',
    ],
    tableCaption: 'Default durations',
    head: { kind: 'Kind', duration: 'Duration' },
    rows: [
      { kind: 'No icon, success, info', duration: '5 seconds' },
      { kind: 'Warning, error', duration: '8 seconds (allowing time to read it again)' },
      { kind: 'With a button', duration: '10 seconds or more (allowing time to reach the button)' },
      { kind: 'Loading (toast.promise)', duration: 'Does not close on a timer' },
    ],
  },
  action: {
    title: 'Undo',
    intro: 'After an action that can be reversed, carrying it out at once and adding “Undo” to the toast is faster than stopping people with a confirmation modal. A toast can hold only one button.',
    exampleTitle: 'Delete a draft',
    exampleDescription: 'Deletion takes effect immediately. Press “Undo” within 10 seconds to bring the draft back.',
  },
  promise: {
    title: 'While a task runs',
    intro: '`toast.promise` shows a loading toast while the task runs (it does not close on a timer), and when the task finishes, replaces it in place with success or error.',
    exampleTitle: 'Save',
    exampleDescription: 'Try a save that takes 1.5 seconds, both when it succeeds and when it fails.',
  },
  position: {
    title: 'Position',
    intro: 'Six positions: top or bottom, at the left, center or right. The default is the bottom right (the bottom left in right-to-left languages). When toasts appear at the top, the newest goes on top, so the visual order matches the reading order.',
    choose: 'Position',
    labels: {
      'top-start': 'Top left',
      'top-center': 'Top',
      'top-end': 'Top right',
      'bottom-start': 'Bottom left',
      'bottom-center': 'Bottom',
      'bottom-end': 'Bottom right',
    },
    try: 'Show one',
    message: (place: string): string => `Position: ${place}`,
    body: [
      'At most `max` toasts are shown at once (3 by default). Beyond that, the oldest close first. When one closes, the rest slide over to fill the gap.',
      'Entry and exit follow the tokens of the motion level. With `expressive`, toasts spring in from the edge; with `none`, they appear and disappear without moving.',
    ],
  },
  modal: {
    title: 'Above a modal',
    intro: 'While a modal is open, elements outside it cannot be pressed and are not read out either (even when they are in the top layer). So when a modal opens, toasts move into the topmost dialog and are shown again above it.',
    exampleTitle: 'Copy inside a modal',
    exampleDescription: 'The toast appears above the modal and can be closed with ×. Pressing Esc on the toast does not close the modal.',
    body: ['After the move, the time left and the meter carry on from where they were. When the modal closes, toasts go back to where they were.'],
  },
  keys: {
    title: 'Interaction',
    tableCaption: 'Toast interaction',
    head: { key: 'Input', action: 'Action' },
    rows: [
      { key: 'Tab', action: 'Moves to the toast’s buttons. The timer stops while focus is inside' },
      { key: 'Esc', action: 'Closes the focused toast (the modal stays open)' },
      {
        key: 'Enter / Space',
        action: 'Presses the button (Undo or ×). When the toast closes, focus moves to the neighboring toast, or, if it was the last one, back to where it was before',
      },
      { key: 'Swipe sideways', action: 'Slides it off in the direction of the swipe and closes it (past 35% of its width, or with a quick swipe)' },
    ],
  },
  host: {
    title: 'Placing the host',
    body: [
      'Put exactly one `<ToastHost />` at the root of your app. Wherever `toast()` is called from, it renders there. Calling it with no host gives a warning during development.',
      'The notification region is a landmark named “Notifications”, with `aria-live="polite"`. The region stays in place even when there are no toasts (a live region is reliably read out only when it exists before its content).',
    ],
  },
  apiCaption: {
    functions: 'toast functions',
    head: { call: 'Call', returns: 'Returns', description: 'Description' },
    rows: [
      { call: 'toast(message, options?)', returns: 'id', description: 'Shows a toast with no icon. Choose a tone with options.tone' },
      { call: 'toast.success / info / warning / error(message, options?)', returns: 'id', description: 'Shows a toast with that tone' },
      {
        call: 'toast.promise(promise, messages, options?)',
        returns: 'Promise',
        description: 'Shows loading while the task runs, then replaces it when done. Returns the Promise you passed in, as is',
      },
      { call: 'toast.dismiss(id?)', returns: '—', description: 'Closes a toast. Omit id to close all of them' },
    ],
  },
  a11yCaption: 'Specification items toasts satisfy',
} satisfies typeof ja;
