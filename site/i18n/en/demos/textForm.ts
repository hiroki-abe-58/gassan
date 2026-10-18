import type ja from '../../ja/demos/textForm';

export default {
  open: 'Create an account',
  title: 'Create an account',
  name: 'Display name',
  password: 'Password',
  passwordHelp: 'At least 8 characters',
  bio: 'About you',
  bioPlaceholder: 'Your work and interests',
  seats: 'Seats',
  seatsHelp: 'You can add more later',
  seatsUnit: 'seats',
  code: 'Verification code',
  codeHelp: 'The 6-digit number sent to you by email',
  cancel: 'Cancel',
  submit: 'Sign up',
  comments: {
    password: 'The visibility toggle is an aria-pressed toggle, so a single label is enough (I-04)',
    counter: 'Passing maxLength shows “n / 140” and ties it in as a description (I-06)',
    code: 'A single input. The boxes are purely visual, so SMS autofill and pasting work (I-08)',
  },
} satisfies typeof ja;
