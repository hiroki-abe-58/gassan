import type ja from '../../ja/demos/quickStart';

export default {
  open: 'Open',
  title: 'Edit profile',
  name: 'Display name',
  cancel: 'Cancel',
  save: 'Save',
  comments: {
    alwaysMounted: 'Keep it mounted and open and close it with open. Write {open && <Modal.Root />}, and the exit animation cannot be drawn',
  },
} satisfies typeof ja;
