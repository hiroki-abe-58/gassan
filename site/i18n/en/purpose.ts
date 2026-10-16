import type ja from '../ja/purpose';

export default {
  lead: 'A modal is not a box for displaying information. Miss this one point, and you get something that looks right yet always feels slightly off.',
  reasons: {
    title: 'There are only four reasons to branch',
    intro: 'A modal stops the user in their tracks. Only the following four situations justify that.',
    tableCaption: 'The four reasons a modal is justified',
    body: [
      'NN/g sharply criticizes the overuse of overlays, yet defends the lightbox, because it does not take away the context. The one and only way a modal beats the alternatives is that it lets the user do something **while staying where they are**.',
    ],
  },
  alternatives: {
    title: 'If none applies, use a different container',
    intro: 'A modal is not a shelter for UI that has nowhere else to go.',
    items: [
      {
        name: 'Page',
        when: 'The content is the main subject, and the user is not expected to come back',
        why: 'It has a URL and can be shared and reloaded. Squeeze it into a modal and you lose deep links and the back button.',
      },
      {
        name: 'Inline expansion (disclosure)',
        when: 'You want to show a little extra detail right where the user is',
        why: 'It does not branch the flow. There is not even a need to close it after reading.',
      },
      {
        name: 'Popover',
        when: 'Temporary choices or menus',
        why: 'It does not make the background inert. If the user opens it by mistake, clicking outside gets them back as if nothing happened.',
      },
    ],
  },
  guidelines: {
    title: 'Where it fits, and where it does not',
    doTitle: 'Remove this member?',
    doCancel: 'Cancel',
    doRemove: 'Remove',
    do: 'Confirming an irreversible action. The list behind stays visible, so the user never loses track of who they are about to remove.',
    dontTitle: 'Settings',
    dontSave: 'Save',
    dont: 'Do not squeeze a settings screen with nowhere else to go into a modal. Long-running tasks belong on a page, which has a URL and a working back button.',
  },
} satisfies typeof ja;
