import type ja from '../../ja/demos/notifyBell';

export default {
  comment: 'Liam Patel commented',
  commentBody: 'New reply on “Pricing table review”',
  joined: 'Emma Johnson joined the workspace',
  invoice: 'Your invoice for October has been issued',
  invoiceBody: 'Pro plan, 6 seats: ¥9,000',
  release: 'The new dashboard is now available',
  comments: {
    read: 'The demo marks the item you press as read. “Mark all as read” passes no ids, which marks everything as read',
  },
} satisfies typeof ja;
