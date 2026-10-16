import type ja from '../ja/button';

export default {
  lead: 'Three levels — primary, secondary and tertiary — plus danger for irreversible actions. Ready, loading, gated and unavailable can be told apart by shape, not by color alone.',
  variants: {
    title: 'Variants',
    intro: 'Three levels of weight make it obvious at a glance which button moves things forward. A footer holds at most one of each.',
    items: {
      primary: {
        label: 'Publish',
        role: 'The action that fulfills the purpose of the screen. Only one per screen (F-01).',
        look: 'An accent fill, with a text color to match.',
        reasons: [
          'At the same size, a fill draws the eye the most. To give the eye a single place to land first, only primary is filled.',
          'Text and fill reach 4.5:1 or more. Even when the site theme changes the color, this is guaranteed by calculation.',
          'Placed last in the row. DOM order = visual order = Tab order, so it comes where the user finishes reading (F-02). ⌘ / Ctrl + Enter presses it too (F-10).',
        ],
      },
      secondary: {
        label: 'Save draft',
        role: 'Another choice alongside primary, such as saving a draft or going back.',
        look: 'No fill; a strong outline and the same text color as body text.',
        reasons: [
          'Leaving it unfilled shows its rank below primary; the outline shows the area that can be pressed.',
          'The text (the body text color, at 4.5:1 or more) is what tells you it is a button. The outline only shows the hierarchy; with the increased contrast setting (prefers-contrast: more), the text color gets darker too.',
        ],
      },
      tertiary: {
        label: 'Cancel',
        role: 'An action that backs out, such as cancel, later or learn more.',
        look: 'No fill and no outline, in the secondary text color. Set apart at the left end of the row (F-03).',
        reasons: [
          'It gets the weakest look and is placed away from primary, so it is not pressed by mistake in a hurry.',
          'Even the secondary text color reaches 4.5:1 or more against the surface.',
          'Only the side padding is reduced; the height stays 44px (F-05). It looks close to plain text, but the pressable area does not shrink.',
        ],
      },
      danger: {
        label: 'Delete',
        role: 'An irreversible action. Used in place of primary.',
        look: 'A red fill, in the primary position.',
        reasons: [
          'The position stays the same; only the color changes (F-06). That way the hand’s memory of the usual spot does not press a different action.',
          'This button never gets initial focus (K-05). A single Enter would do something irreversible.',
          'It does not rely on red alone: the verb in the label says what will happen. Even if the color is hard to tell, reading tells you.',
        ],
      },
    },
  },
  states: {
    title: 'States',
    intro: 'All six states, drawn for all four variants. The ratios below are measured on the spot from the colors currently drawn on screen. Change the theme and they are measured again.',
    look: 'Look',
    why: 'Rationale',
    items: {
      rest: {
        name: 'Ready',
        api: 'default',
        look: 'The base look of each variant. The pointer becomes a hand.',
        why: 'Pressable buttons share the same height (44px, or 48px with a coarse pointer) and corner radius whatever the variant. Pressable things share one shape, which sets them apart from things that cannot be pressed.',
      },
      hover: {
        name: 'Hovered',
        api: ':hover',
        look: 'secondary and tertiary get a light surface underneath. primary and danger keep their fill and lift with a shadow.',
        why: 'Lightening or darkening the background of a filled button would push the color, tuned by the theme to just 4.5:1, below the ratio with its text. So it responds with a shadow rather than with color.',
      },
      focus: {
        name: 'Reached by keyboard',
        api: ':focus-visible',
        look: 'A 2px ring, drawn 2px away from the button.',
        why: 'Since it is drawn with a gap, the ring does not melt into the fill even on filled buttons. The ring reaches 3:1 or more against the surface (K-07). It does not appear when pressed with a mouse.',
      },
      loading: {
        name: 'Loading',
        api: 'onAction returns a Promise / loading',
        look: 'The label turns transparent and a spinner is laid over it. The width does not change.',
        why: 'Pressing it does nothing (double-submit prevention, F-08). The label is hidden with `opacity: 0`, so the accessible name remains. `visibility: hidden` would remove the name with it, leaving a button with no name (F-07). The spinner is not text, so it needs 3:1 or more.',
      },
      gated: {
        name: 'Gated (pressable once the conditions are met)',
        api: 'gate',
        look: 'A gray fill (a thin outline for secondary and tertiary). The text stays clearly readable.',
        why: 'It uses `aria-disabled`, not `disabled` (G-01). It takes focus, and pressing it announces the reason and takes the user to where they are stuck (G-07 / G-08). Since it takes focus, it cannot rely on WCAG’s “inactive components are exempt”, so instead of fading with `opacity` it keeps 4.5:1 (G-10).',
      },
      unavailable: {
        name: 'Unavailable',
        api: 'unavailable',
        look: 'No fill, and a dashed outline.',
        why: 'A real `disabled`, used only when the button truly cannot be pressed on this screen, such as without permission. It does not take focus either. It is dashed so that it can be told apart by shape from gated (a filled gray). It is exempt from WCAG, but the text still keeps a readable ratio, in the secondary text color.',
      },
    },
    callout:
      'States are never conveyed by color alone. Shadow, ring, spinner, filled gray and dashed line all differ in shape. They can be told apart by people who have trouble distinguishing colors, and in forced colors mode (Windows high contrast) too.',
  },
  measure: {
    ink: 'Text',
    spinner: 'Spinner',
    ring: 'Ring',
    exempt: '(exempt)',
    meets: (min: number): string => `(minimum ${String(min)})`,
    fails: (min: number): string => `(below the minimum of ${String(min)})`,
  },
  gated: {
    title: 'Keep gated and unavailable apart',
    intro: 'Both mean “cannot be pressed right now”, but they differ in whether there is a way to make it pressable. gassan hardly ever uses disabled.',
    tableCaption: 'How gated and unavailable differ',
    aspect: 'Aspect',
    gated: 'Gated',
    unavailable: 'Unavailable',
    rows: [
      { aspect: 'How to write it', gated: 'gate (aria-disabled)', unavailable: 'unavailable (disabled)' },
      { aspect: 'Focus', gated: 'Takes focus', unavailable: 'Does not take focus' },
      { aspect: 'When pressed', gated: 'Announces the reason and takes the user to where they are stuck', unavailable: 'Nothing happens' },
      { aspect: 'Look', gated: 'Gray fill', unavailable: 'Dashed outline' },
      { aspect: 'Text contrast', gated: 'Keeps 4.5:1 (G-10)', unavailable: 'Exempt from WCAG. Still keeps a readable ratio' },
      { aspect: 'When to use', gated: 'Pressable once reading, consent or input is complete', unavailable: 'Cannot be pressed on this screen, such as without permission' },
    ],
    body: [
      'A `disabled` button cannot take focus. Keyboard and screen reader users are told neither that the button exists nor why it cannot be pressed. Make a “pressable once the conditions are met” button `disabled`, and those users alone cannot move on.',
    ],
    exampleTitle: 'Press a gated button',
    exampleDescription: 'Until topics are chosen, “Save these choices” is gated. Pressing it announces the reason and moves focus to the options.',
  },
  live: {
    title: 'Press it for real',
    intro: 'While loading, it runs only once no matter how many times it is pressed.',
    exampleTitle: 'Publish the article',
    exampleDescription: 'A footer with tertiary, secondary and primary, weakest first. Try mashing “Publish”.',
  },
  size: {
    title: 'Size and arrangement',
    rules: [
      {
        title: 'At least 44px tall',
        body: 'Stricter than the 24px minimum of WCAG 2.5.8, matching Apple’s 44pt. On touch devices (`pointer: coarse`) it is 48px (F-05).',
      },
      {
        title: 'Write them weakest first',
        body: 'Write tertiary → secondary → primary, and DOM order, visual order and Tab order line up (F-02). On narrow screens they stack vertically in the same order, never reversed (F-04).',
      },
      {
        title: 'Labels break at phrases',
        body: 'When a label wraps onto 2 lines on a narrow screen, it breaks at a phrase boundary, as in “プロフィールを｜編集”. See [Japanese line breaking](#/styles/line-break).',
      },
      {
        title: 'Say the result with a verb',
        body: 'Not “OK” or “Yes”, but “Publish” or “Delete”. Reading the button alone should tell you what pressing it does.',
      },
    ],
  },
  a11yCaption: 'Specification items buttons satisfy',
} satisfies typeof ja;
