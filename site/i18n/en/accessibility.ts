import type ja from '../ja/accessibility';

export default {
  lead: 'Do not touch what the browser does, and do everything the browser does not. gassan’s accessibility rests on these two pillars.',
  native: {
    title: 'What is left to the browser',
    intro: 'showModal() handles these. A hand-rolled version always leaks somewhere, so the right answer is not to write one.',
    tableCaption: 'Items delegated to the platform',
    callout:
      'Not even `aria-modal` is set. The top layer and inert of `showModal()` are at least as effective, and specifying both makes some screen readers behave erratically (A-03).',
  },
  name: {
    title: 'The name is never cut',
    body: [
      'The dialog’s name points via `aria-labelledby` to a `<span>` inside the `<h2>`. Long titles are truncated with CSS `line-clamp` alone; the DOM text is never cut. So even when the screen shows two truncated lines, the announced name is always complete.',
    ],
    mockLong: 'Change the sharing settings of the Q3 Tohoku region sales report by store',
    mockToggle: 'Show the full title',
    mockCut: 'Change the sharing settings of the Q3 Tohoku…',
    mockTooltip: 'title attribute tooltip',
    do: 'Truncate with CSS, and show an explicit toggle only when the title overflows. Keep the toggle’s text outside the name span (T-03 / T-08).',
    dont: "Do not cut it in JS with `title.slice(0, 30) + '…'`. The name gets cut along with it. Moving the rest into the `title` attribute does not work either: it never appears on touch, and it fails WCAG 1.4.13 (T-05).",
  },
  gate: {
    title: 'Press it to hear why it cannot be pressed',
    body: [
      'A button that stays unpressable until conditions are met does not use `disabled`. A `disabled` button cannot receive focus, so keyboard and screen reader users lose the very means of finding out why they cannot proceed. gassan sets `aria-disabled="true"` instead; when pressed, the button announces the reason and takes the user to where they are stuck.',
    ],
    mockTitle: 'Updated terms of service',
    mockButton: 'Agree and continue',
    mockNote: 'Tick the box to agree',
    do: '`aria-disabled` + an always-visible reason + an announcement and guidance when pressed (G-01 / G-07 / G-08). The look uses dedicated tokens that keep 4.5:1 (G-10).',
    dont: 'Do not settle for `disabled` and `opacity: .4`. The user cannot tell why, and cannot read the text either.',
  },
  read: {
    title: '“Read” is a logical OR',
    intro:
      'Judging “read” by scroll position alone locks out users who read with a virtual cursor: they never fire scroll events, so they can never proceed.',
    signals: [
      { who: 'Mouse, touch, wheel', signal: 'The sentinel at the end of the content came into view' },
      { who: 'Keyboard, screen reader', signal: 'Focus reached the end-of-content marker (“End of content.”)' },
      { who: 'Large screen, short content', signal: 'The content never needed scrolling in the first place (judged only when it can be measured)' },
    ],
    chips: 'Read gate specification',
  },
  focus: {
    title: 'Where focus goes',
    mockTitle: 'Invite a member',
    mockButton: 'Invite',
    do: 'Right after opening, focus goes to the panel itself (K-03). Screen readers can then start reading from the title.',
    dont: 'On touch devices, do not focus the first input. The virtual keyboard pops up and hides the content (K-04). Avoid focusing the × button too, since it makes users skip the content.',
  },
  tables: {
    title: 'Keyboard and assistive technology items',
    keyboardCaption: 'Keyboard / focus items',
    assistiveCaption: 'Assistive technology items',
  },
  preferences: {
    title: 'Follow the user’s settings',
    tableCaption: 'Items that follow OS and browser settings',
  },
} satisfies typeof ja;
