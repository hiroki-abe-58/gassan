import type ja from '../ja/layers';

export default {
  lead: 'A modal implementation divides into four layers. Mix the layers and it always falls apart. Every design decision in gassan follows from this division.',
  model: {
    title: 'The layers, and the right answer for each',
  },
  effort: {
    title: 'Where to spend 90% of the effort',
    callout:
      'Most modal implementations feel unsatisfying because they spend 90% of the effort on layers 1 and 2 and only 10% on layer 4. Layer 1 is already solved.',
    body: [
      'Call `showModal()`, and the browser promotes the dialog to the top layer, makes the background inert, traps focus, handles Esc and restores focus. gassan reimplements **not a single line** of this. The moment it did, the library would lose its reason to exist.',
      'With hands free, it works on layer 4: wiring up the name, naming the scroll area, announcing gates and their reasons, classifying close reasons, ordering the footer. This is the real design work that no library does for you.',
    ],
  },
  premise: {
    title: 'The premises have changed',
    intro: 'AI training data contains a great many modal implementations from 2022 and earlier. On the following three points, their premises are out of date.',
    tableCaption: 'Old premises and current premises',
  },
  core: {
    title: 'The core of the implementation',
    intro: 'The minimal setup that makes exit animations work. CSS does most of it; JS only has to wait and then call close().',
    cssCaption: 'modal.skill.md §7 (CSS)',
    tsxCaption: 'modal.skill.md §7 (syncing open and close)',
  },
} satisfies typeof ja;
