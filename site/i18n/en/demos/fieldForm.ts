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
    group: 'Name a group of options with fieldset / legend, not label',
    native: 'range and date alike: just wrap the native control instead of rebuilding it',
  },
} satisfies typeof ja;
