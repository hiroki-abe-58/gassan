import type ja from '../../ja/demos/kindForm';

export default {
  open: 'Edit profile',
  jazz: 'Jazz',
  ambient: 'Ambient',
  classic: 'Classical',
  techno: 'Techno',
  nameRequired: 'Enter a display name',
  discardTitle: 'Discard your changes?',
  discard: 'Discard',
  backToEdit: 'Keep editing',
  title: 'Edit profile',
  name: 'Display name',
  nameHelp: 'Up to 20 characters',
  genres: 'Favorite genres',
  notify: 'Notify me of new arrivals',
  shortcut: '⌘ / Ctrl + Enter also saves',
  cancel: 'Cancel',
  save: 'Save',
  comments: {
    leaveGuard: 'Hold it open when there is unsaved input. The confirmation uses the imperative API and stacks one more modal on top of the form.',
  },
} satisfies typeof ja;
