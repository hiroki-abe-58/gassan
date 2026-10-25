import type ja from '../../ja/demos/chartPareto';

export default {
  label: 'Support requests by type',
  description: 'Sign-in, billing and how-to questions make up more than 80%. Fix the help articles for these three first.',
  count: 'Requests',
  login: 'Can’t sign in',
  billing: 'Billing',
  howTo: 'How-to',
  bug: 'Bugs',
  cancel: 'Cancellation',
  other: 'Other',
  comments: {
    other: 'Items marked other are not sorted by size; they stay at the end',
  },
} satisfies typeof ja;
