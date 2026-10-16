import type ja from '../../ja/demos/footerButtons';

export default {
  open: 'Publish settings',
  title: 'Publish the article',
  description: 'Mash “Publish”, and a second run does not start until the first one finishes (F-08). Submissions so far: {0}',
  note: 'You can still edit after publishing',
  cancel: 'Cancel',
  saveDraft: 'Save draft',
  publish: 'Publish',
  comments: {
    order: 'DOM order = visual order = Tab order. Write them weakest first. Only the first tertiary moves away to the left (F-02 / F-03)',
  },
} satisfies typeof ja;
