import type ja from '../../ja/demos/playground';

export default {
  kindDefault: 'kind default ({0})',
  esc: 'Close with Esc',
  backdrop: 'Backdrop click',
  closes: 'Closes',
  refuses: 'Refuses and announces the reason',
  open: 'Open with these settings',
  closedBy: 'Close reason: {0}',
  logEmpty: 'Records whether it was closed with Esc, the backdrop or ×',
  description: 'Try Esc, a backdrop click and the × button. When closing is not allowed, the panel shakes and the reason is announced.',
  done: 'Done',
  comments: {
    choice: 'One Modal.Select row. An empty-string value stands for “kind default”. It is a button inside a <label>, so the heading becomes its name as is.',
  },
} satisfies typeof ja;
