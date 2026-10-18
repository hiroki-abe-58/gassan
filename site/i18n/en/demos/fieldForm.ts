import type ja from '../../ja/demos/fieldForm';

export default {
  planFree: 'Free',
  planPro: 'Pro (¥980/month)',
  emailError: 'Enter an email address that contains @',
  open: 'Invite a member',
  title: 'Invite a member',
  alert: 'Check your input (errors: {0})',
  email: 'Email address',
  emailHelp: 'An invitation email will be sent',
  plan: 'Plan',
  seats: 'Seats',
  seatsHelp: 'Seats: {0}',
  cancel: 'Cancel',
  submit: 'Invite',
  comments: {
    summary: 'The summary of failed submission goes in one place. Focus moves to the first field with an error (B-09)',
    field: 'One input, one Modal.Field. It takes on wiring up the label, help and error (B-08)',
    group: 'A group of options is a Modal.Fieldset. It is named with a legend, not a label (I-09)',
    native: 'A native range underneath. The thumb and fill are drawn in the theme’s colors (I-10)',
  },
} satisfies typeof ja;
