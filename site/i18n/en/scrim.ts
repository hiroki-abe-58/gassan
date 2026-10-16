import type ja from '../ja/scrim';

export default {
  lead: 'The scrim’s job is to say “the background cannot be touched right now”, not to erase the background. The default is 32% black with no blur; choose from four levels according to intent.',
  levels: {
    title: 'The four levels',
    intro: 'The values are read from the tokens in src/styles.css.',
    mockTitle: 'Delete this draft?',
    mockDelete: 'Delete',
    tableCaption: 'Scrim tokens and when to use them',
  },
  try: {
    title: 'Open and compare',
    exampleTitle: 'The four scrim levels',
    exampleDescription: 'Opens the same panel with each level of scrim.',
  },
  why: {
    title: 'Why not 60%',
    body: [
      '32% matches the Material Design 3 scrim specification. 60–80% black erases the context behind — the one thing a modal does better than the alternatives. The user can no longer tell who they are about to delete, or which row they are viewing the details of.',
    ],
    mockTitle: 'Delete this row?',
    mockDelete: 'Delete',
    do: 'The default 32%. The list behind stays readable, so the user never loses track of what the action applies to.',
    dont: 'Do not make 60–80% black the default. It throws away the one strength of a modal: keeping the context (§5, item 9).',
  },
  blur: {
    title: 'When blur is allowed',
    intro: 'Blur is an explicit opt-in only (immersive), and only when all of the following hold.',
    body: [
      'When blur is turned off, the substitute is “raise the opacity”. Under `prefers-reduced-transparency: reduce`, gassan removes the blur automatically and adds density to make up for it. Remove only the blur and leave it at 32%, and nothing gets through to people who have reduced transparency.',
    ],
  },
  dark: {
    title: 'Dark theme',
    intro: 'A black scrim does not work on a dark UI. A dark film over a dark background creates no separation.',
    mockTitle: 'Save settings?',
    mockSave: 'Save',
    do: 'Lighten the surface and separate it with a 1px border (S-07).',
    dont: 'Do not try to separate it with a denser scrim. It only adds darkness; the panel’s outline does not appear.',
  },
  spec: {
    title: 'Scrim items',
    tableCaption: 'Scrim specification',
  },
} satisfies typeof ja;
