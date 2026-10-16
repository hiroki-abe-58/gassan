import type ja from '../../ja/demos/imperativeConfirm';

export default {
  logoutTitle: 'Log out?',
  logout: 'Log out',
  callOne: 'Call confirm',
  firstTitle: '1st: Turn off notifications?',
  secondTitle: '2nd: Confirm account deletion',
  consent: 'I understand',
  secondLog: '2nd → {0}',
  callTwo: 'Call two at once',
  comments: {
    host: 'Put one <ModalHost /> at the root of your app (on this site it lives in App.tsx).',
    queue: 'Call two at once, and they still appear one at a time (L-14)',
  },
} satisfies typeof ja;
