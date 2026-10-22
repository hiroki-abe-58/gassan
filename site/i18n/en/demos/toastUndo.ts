import type ja from '../../ja/demos/toastUndo';

export default {
  draftA: 'Quarterly review',
  draftB: 'Careers page copy',
  draftC: 'Release notes v2.4',
  remove: 'Delete',
  removeLabel: 'Delete {0}',
  removed: 'Deleted “{0}”',
  undo: 'Undo',
  empty: 'No drafts',
  reset: 'Restore the drafts',
  comments: {
    undo: 'Carry out reversible actions right away instead of stopping for a confirmation, and add “Undo” to the toast. With a button, it stays for 10 seconds',
  },
} satisfies typeof ja;
