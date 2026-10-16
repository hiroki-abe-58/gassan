import type ja from '../../ja/demos/kindConfirm';

export default {
  open: 'Delete draft',
  closedReason: 'Close reason: {0}',
  title: 'Delete this draft?',
  description: 'This cannot be undone. It also disappears from your collaborators’ screens.',
  cancel: 'Cancel',
  confirm: 'Delete',
  comments: {
    danger: 'Keep the primary position and change only the color to danger (F-06)',
  },
} satisfies typeof ja;
